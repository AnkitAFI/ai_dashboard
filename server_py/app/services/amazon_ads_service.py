import httpx
import logging
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.schema_v2 import AmazonAdsCredential, AmazonAdsProfile, AmazonAdsCampaignPerformance
from app.services.rate_limiter import rate_limiter

logger = logging.getLogger(__name__)

class AmazonAdsService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.cred = db.query(AmazonAdsCredential).filter(AmazonAdsCredential.user_id == user_id).first()
        self.client_id = settings.AMAZON_LWA_CLIENT_ID
        self.client_secret = settings.AMAZON_LWA_CLIENT_SECRET
        
    async def _refresh_token_if_needed(self):
        """Refresh the LWA access token if it is expired or missing."""
        if not self.cred or not self.cred.refresh_token:
            raise ValueError("No Amazon Ads credentials found for user.")
            
        now = datetime.utcnow()
        if self.cred.access_token and self.cred.access_token_expires_at and self.cred.access_token_expires_at > now + timedelta(minutes=5):
            return # Still valid
            
        url = "https://api.amazon.com/auth/o2/token"
        data = {
            "grant_type": "refresh_token",
            "refresh_token": self.cred.refresh_token,
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, data=data)
            if resp.status_code == 200:
                result = resp.json()
                self.cred.access_token = result.get("access_token")
                self.cred.access_token_expires_at = now + timedelta(seconds=result.get("expires_in", 3600))
                self.db.commit()
                logger.info(f"Successfully refreshed Amazon Ads token for user {self.user_id}")
            else:
                logger.error(f"Failed to refresh Amazon Ads token: {resp.text}")
                raise Exception("Failed to refresh Amazon Ads token")

    def _get_api_url(self) -> str:
        """Get the base API URL for the India/APAC region."""
        # Since the app focuses exclusively on India, we hardcode the APAC endpoint
        return "https://advertising-api-fe.amazon.com"

    async def get_headers(self, profile_id: Optional[str] = None) -> dict:
        await self._refresh_token_if_needed()
        headers = {
            "Authorization": f"Bearer {self.cred.access_token}",
            "Amazon-Advertising-API-ClientId": self.client_id,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if profile_id:
            headers["Amazon-Advertising-API-Scope"] = profile_id
        return headers

    async def sync_profiles(self) -> List[Dict]:
        """Fetch profiles from Amazon Ads API and sync to DB."""
        await rate_limiter.wait_for_token("profiles")
        
        url = f"{self._get_api_url()}/v2/profiles"
        headers = await self.get_headers()
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                logger.error(f"Failed to fetch profiles: {resp.text}")
                return []
                
            profiles = resp.json()
            
            # Calculate and enforce hard limits
            from app.models.schema_v2 import UserSubscription
            sub = self.db.query(UserSubscription).filter(UserSubscription.user_id == self.user_id).first()
            tier = sub.subscription_tier if sub else "free"
            
            if tier == "enterprise":
                limit = sub.max_ad_profiles if sub and sub.max_ad_profiles is not None else 3
            else:
                limit = 1
                
            # Strictly slice the response to prevent DB bloat and protect rate limits
            profiles = profiles[:limit]
            
            # Sync to DB
            synced_profiles = []
            for p in profiles:
                profile_id = str(p.get("profileId"))
                db_profile = self.db.query(AmazonAdsProfile).filter(
                    AmazonAdsProfile.user_id == self.user_id,
                    AmazonAdsProfile.profile_id == profile_id
                ).first()
                
                if not db_profile:
                    db_profile = AmazonAdsProfile(
                        user_id=self.user_id,
                        profile_id=profile_id,
                        country_code=p.get("countryCode"),
                        currency_code=p.get("currencyCode"),
                        timezone=p.get("timezone"),
                        account_info=p.get("accountInfo", {}).get("type", "Unknown")
                    )
                    self.db.add(db_profile)
                synced_profiles.append({
                    "profile_id": profile_id,
                    "country_code": p.get("countryCode"),
                    "account_info": p.get("accountInfo", {}).get("type")
                })
                
            # Cleanup: If the user downgraded (e.g. Enterprise to Free), delete any extra profiles in the DB
            # that are no longer allowed under their new limit. This prevents them from keeping extra profiles for free.
            allowed_profile_ids = [sp["profile_id"] for sp in synced_profiles]
            self.db.query(AmazonAdsProfile).filter(
                AmazonAdsProfile.user_id == self.user_id,
                AmazonAdsProfile.profile_id.notin_(allowed_profile_ids)
            ).delete(synchronize_session=False)
            
            self.db.commit()
            return synced_profiles

    async def update_campaign_status(self, profile_id: str, campaign_id: str, state: str) -> bool:
        """Update a campaign's state (enabled, paused, archived) on Amazon Ads."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        try:
            await rate_limiter.wait_for_token("campaigns")
        except AmazonAdsCircuitBreakerException:
            logger.error("Circuit breaker active, skipping campaign update")
            return False
            
        url = f"{self._get_api_url()}/v2/sp/campaigns"
        headers = await self.get_headers(profile_id=profile_id)
        
        # Amazon requires campaignId as a number in some endpoints, but we handle it safely.
        try:
            c_id = int(campaign_id)
        except ValueError:
            c_id = campaign_id
            
        data = [{
            "campaignId": c_id,
            "state": state.lower() # "enabled" or "paused"
        }]
        
        async with httpx.AsyncClient() as client:
            resp = await client.put(url, headers=headers, json=data)
            if resp.status_code == 429:
                from app.services.rate_limiter import AmazonAdsRateLimiter
                AmazonAdsRateLimiter.trip_circuit_breaker()
                logger.error("Received 429 Too Many Requests from Amazon Ads during campaign update!")
                return False
                
            if resp.status_code not in (200, 207):
                logger.error(f"Failed to update campaign status: {resp.text}")
                return False
                
            result = resp.json()
            if isinstance(result, list) and len(result) > 0:
                if result[0].get("code") == "SUCCESS":
                    return True
                else:
                    logger.error(f"Amazon returned error for campaign update: {result[0]}")
                    return False
                    
            return True

    async def update_campaign_budget(self, profile_id: str, campaign_id: str, new_daily_budget: float) -> bool:
        """Update a campaign's daily budget on Amazon Ads."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        try:
            await rate_limiter.wait_for_token("campaigns")
        except AmazonAdsCircuitBreakerException:
            logger.error("Circuit breaker active, skipping campaign budget update")
            return False
            
        url = f"{self._get_api_url()}/v2/sp/campaigns"
        headers = await self.get_headers(profile_id=profile_id)
        
        try:
            c_id = int(campaign_id)
        except ValueError:
            c_id = campaign_id
            
        data = [{
            "campaignId": c_id,
            "dailyBudget": float(new_daily_budget)
        }]
        
        async with httpx.AsyncClient() as client:
            resp = await client.put(url, headers=headers, json=data)
            if resp.status_code == 429:
                from app.services.rate_limiter import AmazonAdsRateLimiter
                AmazonAdsRateLimiter.trip_circuit_breaker()
                logger.error("Received 429 Too Many Requests from Amazon Ads during budget update!")
                return False
                
            if resp.status_code not in (200, 207):
                logger.error(f"Failed to update campaign budget: {resp.text}")
                return False
                
            result = resp.json()
            if isinstance(result, list) and len(result) > 0:
                if result[0].get("code") == "SUCCESS":
                    return True
                else:
                    logger.error(f"Amazon returned error for budget update: {result[0]}")
                    return False
            return False

    async def get_campaigns(self, profile_id: str) -> List[Dict]:
        """Fetch all campaigns for a profile, including current bidding adjustments."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        try:
            await rate_limiter.wait_for_token("campaigns")
        except AmazonAdsCircuitBreakerException:
            logger.error("Circuit breaker active, skipping campaign fetch")
            return []
            
        url = f"{self._get_api_url()}/v2/sp/campaigns"
        headers = await self.get_headers(profile_id=profile_id)
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 429:
                from app.services.rate_limiter import AmazonAdsRateLimiter
                AmazonAdsRateLimiter.trip_circuit_breaker()
                logger.error("Received 429 Too Many Requests from Amazon Ads during campaign fetch!")
                return []
                
            if resp.status_code != 200:
                logger.error(f"Failed to fetch campaigns: {resp.text}")
                return []
                
            return resp.json()

    async def request_campaign_report(self, profile_id: str, report_date: str) -> Optional[str]:
        """Request a standard sponsored products campaign report for a specific date (YYYYMMDD)."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        try:
            await rate_limiter.wait_for_token("reports")
        except AmazonAdsCircuitBreakerException:
            logger.error("Circuit breaker active, skipping report request")
            return None
            
        url = f"{self._get_api_url()}/v2/sp/campaigns/report"
        headers = await self.get_headers(profile_id=profile_id)
        
        # Payload for v2 reporting API
        data = {
            "reportDate": report_date,
            "metrics": "campaignName,campaignStatus,impressions,clicks,cost,purchases1d,purchases7d,purchases14d,purchases30d"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=data)
            if resp.status_code == 429:
                from app.services.rate_limiter import AmazonAdsRateLimiter
                AmazonAdsRateLimiter.trip_circuit_breaker()
                logger.error("Received 429 Too Many Requests from Amazon Ads! Tripped circuit breaker.")
                return None
                
            if resp.status_code not in (200, 202):
                logger.error(f"Failed to request campaign report: {resp.text}")
                return None
                
            result = resp.json()
            return result.get("reportId")

    async def request_keyword_report(self, profile_id: str, report_date: str) -> Optional[str]:
        """Request a standard sponsored products keyword report for a specific date (YYYYMMDD)."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        try:
            await rate_limiter.wait_for_token("reports")
        except AmazonAdsCircuitBreakerException:
            logger.error("Circuit breaker active, skipping keyword report request")
            return None
            
        url = f"{self._get_api_url()}/v2/sp/keywords/report"
        headers = await self.get_headers(profile_id=profile_id)
        
        data = {
            "reportDate": report_date,
            "metrics": "campaignId,keywordId,keywordText,matchType,state,impressions,clicks,cost,purchases1d,purchases7d,purchases14d,purchases30d"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=data)
            if resp.status_code == 429:
                from app.services.rate_limiter import AmazonAdsRateLimiter
                AmazonAdsRateLimiter.trip_circuit_breaker()
                return None
                
            if resp.status_code not in (200, 202):
                logger.error(f"Failed to request keyword report: {resp.text}")
                return None
                
            result = resp.json()
            return result.get("reportId")

    async def request_search_term_report(self, profile_id: str, report_date: str) -> Optional[str]:
        """Request a standard sponsored products search term report for a specific date (YYYYMMDD)."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        try:
            await rate_limiter.wait_for_token("reports")
        except AmazonAdsCircuitBreakerException:
            logger.error("Circuit breaker active, skipping search term report request")
            return None
            
        url = f"{self._get_api_url()}/v2/sp/searchTerms/report"
        headers = await self.get_headers(profile_id=profile_id)
        
        data = {
            "reportDate": report_date,
            "metrics": "campaignId,adGroupId,keywordId,keywordText,matchType,searchTerm,impressions,clicks,cost,purchases1d,purchases7d,purchases14d,purchases30d"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=data)
            if resp.status_code == 429:
                from app.services.rate_limiter import AmazonAdsRateLimiter
                AmazonAdsRateLimiter.trip_circuit_breaker()
                return None
                
            if resp.status_code not in (200, 202):
                logger.error(f"Failed to request search term report: {resp.text}")
                return None
                
            result = resp.json()
            return result.get("reportId")

    async def request_placement_report(self, profile_id: str, report_date: str) -> Optional[str]:
        """Request a sponsored products placement report for a specific date (YYYYMMDD)."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        try:
            await rate_limiter.wait_for_token("reports")
        except AmazonAdsCircuitBreakerException:
            logger.error("Circuit breaker active, skipping placement report request")
            return None
            
        url = f"{self._get_api_url()}/v2/sp/campaigns/report"
        headers = await self.get_headers(profile_id=profile_id)
        
        data = {
            "reportDate": report_date,
            "segment": "placement",
            "metrics": "campaignId,impressions,clicks,cost,purchases1d,purchases7d,purchases14d,purchases30d"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=data)
            if resp.status_code == 429:
                from app.services.rate_limiter import AmazonAdsRateLimiter
                AmazonAdsRateLimiter.trip_circuit_breaker()
                return None
                
            if resp.status_code not in (200, 202):
                logger.error(f"Failed to request placement report: {resp.text}")
                return None
                
            result = resp.json()
            return result.get("reportId")

    async def poll_report_status(self, profile_id: str, report_id: str) -> Optional[str]:
        """Poll for report completion with exponential backoff."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        url = f"{self._get_api_url()}/v2/reports/{report_id}"
        
        # Exponential backoff: 10s, 20s, 30s
        for delay in [10, 20, 30]:
            await asyncio.sleep(delay)
            headers = await self.get_headers(profile_id=profile_id)
            
            try:
                await rate_limiter.wait_for_token("reports")
            except AmazonAdsCircuitBreakerException:
                return None
                
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 429:
                    from app.services.rate_limiter import AmazonAdsRateLimiter
                    AmazonAdsRateLimiter.trip_circuit_breaker()
                    return None
                    
                if resp.status_code == 200:
                    result = resp.json()
                    status = result.get("status")
                    if status == "SUCCESS":
                        return result.get("location")
                    elif status == "FAILURE":
                        logger.error(f"Report {report_id} failed to generate.")
                        return None
                        
        logger.warning(f"Report {report_id} did not complete in time.")
        return None

    async def download_and_parse_report(self, location: str, profile_id: str, report_date_str: str) -> None:
        """Download GZIP JSON report, parse, and upsert to DB."""
        import gzip
        import json
        from sqlalchemy.dialects.postgresql import insert
        
        headers = await self.get_headers(profile_id=profile_id)
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(location, headers=headers)
            if resp.status_code != 200:
                logger.error("Failed to download report.")
                return
                
            try:
                content = gzip.decompress(resp.content)
                data = json.loads(content)
            except Exception as e:
                logger.error(f"Failed to decompress/parse report: {e}")
                return
                
            report_date = datetime.strptime(report_date_str, "%Y%m%d").date()
            
            for row in data:
                campaign_id = str(row.get("campaignId"))
                
                record = self.db.query(AmazonAdsCampaignPerformance).filter(
                    AmazonAdsCampaignPerformance.profile_id == profile_id,
                    AmazonAdsCampaignPerformance.campaign_id == campaign_id,
                    AmazonAdsCampaignPerformance.date == report_date
                ).first()
                
                sales = float(row.get("purchases7d", 0)) # Using 7d as standard attribution
                spend = float(row.get("cost", 0))
                
                if record:
                    record.impressions = int(row.get("impressions", 0))
                    record.clicks = int(row.get("clicks", 0))
                    record.spend = spend
                    record.sales = float(row.get("purchases1d", 0))
                    record.campaign_name = row.get("campaignName")
                    record.campaign_status = row.get("campaignStatus")
                else:
                    db_record = AmazonAdsCampaignPerformance(
                        user_id=self.user_id,
                        profile_id=profile_id,
                        campaign_id=campaign_id,
                        date=report_date,
                        campaign_name=row.get("campaignName", ""),
                        campaign_status=row.get("campaignStatus", ""),
                        impressions=int(row.get("impressions", 0)),
                        clicks=int(row.get("clicks", 0)),
                        spend=spend,
                        sales=sales,
                        orders=int(row.get("purchases7d", 0))
                    )
                    self.db.add(db_record)
                
            self.db.commit()
            logger.info(f"Successfully synced campaign report for profile {profile_id} date {report_date_str}")
            
    async def download_and_parse_keyword_report(self, location: str, profile_id: str, report_date_str: str) -> None:
        """Download GZIP JSON keyword report, parse, and upsert to DB."""
        import gzip
        import json
        from app.models.schema_v2 import AmazonAdsKeywordPerformance
        
        headers = await self.get_headers(profile_id=profile_id)
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(location, headers=headers)
            if resp.status_code != 200:
                logger.error("Failed to download keyword report.")
                return
                
            try:
                content = gzip.decompress(resp.content)
                data = json.loads(content)
            except Exception as e:
                logger.error(f"Failed to decompress/parse keyword report: {e}")
                return
                
            report_date = datetime.strptime(report_date_str, "%Y%m%d").date()
            
            for row in data:
                keyword_id = str(row.get("keywordId"))
                
                record = self.db.query(AmazonAdsKeywordPerformance).filter(
                    AmazonAdsKeywordPerformance.profile_id == profile_id,
                    AmazonAdsKeywordPerformance.keyword_id == keyword_id,
                    AmazonAdsKeywordPerformance.date == report_date
                ).first()
                
                if record:
                    record.impressions = row.get("impressions", 0)
                    record.clicks = row.get("clicks", 0)
                    record.spend = row.get("cost", 0.0)
                    record.sales = row.get("purchases1d", 0.0)
                    record.state = row.get("state", "")
                    continue
                    
                db_record = AmazonAdsKeywordPerformance(
                    user_id=self.user_id,
                    profile_id=profile_id,
                    campaign_id=str(row.get("campaignId")),
                    keyword_id=keyword_id,
                    date=report_date,
                    keyword_text=row.get("keywordText", ""),
                    match_type=row.get("matchType", ""),
                    state=row.get("state", ""),
                    impressions=row.get("impressions", 0),
                    clicks=row.get("clicks", 0),
                    spend=row.get("cost", 0.0),
                    sales=row.get("purchases1d", 0.0),
                    orders=row.get("purchases1d", 0)
                )
                self.db.add(db_record)
                
            self.db.commit()

    async def download_and_parse_search_term_report(self, location: str, profile_id: str, report_date_str: str) -> None:
        """Download GZIP JSON search term report, parse, and upsert to DB."""
        import gzip
        import json
        from app.models.schema_v2 import AmazonAdsSearchTermPerformance
        
        headers = await self.get_headers(profile_id=profile_id)
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(location, headers=headers)
            if resp.status_code != 200:
                logger.error("Failed to download search term report.")
                return
                
            try:
                content = gzip.decompress(resp.content)
                data = json.loads(content)
            except Exception as e:
                logger.error(f"Failed to decompress/parse search term report: {e}")
                return
                
            report_date = datetime.strptime(report_date_str, "%Y%m%d").date()
            
            for row in data:
                search_term = row.get("searchTerm", "")
                keyword_id = str(row.get("keywordId", ""))
                if not search_term or not keyword_id:
                    continue
                    
                record = self.db.query(AmazonAdsSearchTermPerformance).filter(
                    AmazonAdsSearchTermPerformance.profile_id == profile_id,
                    AmazonAdsSearchTermPerformance.search_term == search_term,
                    AmazonAdsSearchTermPerformance.keyword_id == keyword_id,
                    AmazonAdsSearchTermPerformance.date == report_date
                ).first()
                
                if record:
                    record.impressions = row.get("impressions", 0)
                    record.clicks = row.get("clicks", 0)
                    record.spend = row.get("cost", 0.0)
                    record.sales = row.get("purchases1d", 0.0)
                    continue
                    
                db_record = AmazonAdsSearchTermPerformance(
                    user_id=self.user_id,
                    profile_id=profile_id,
                    campaign_id=str(row.get("campaignId")),
                    ad_group_id=str(row.get("adGroupId")),
                    keyword_id=keyword_id,
                    date=report_date,
                    search_term=search_term,
                    keyword_text=row.get("keywordText", ""),
                    match_type=row.get("matchType", ""),
                    impressions=row.get("impressions", 0),
                    clicks=row.get("clicks", 0),
                    spend=row.get("cost", 0.0),
                    sales=row.get("purchases1d", 0.0),
                    orders=row.get("purchases1d", 0)
                )
                self.db.add(db_record)
                
            self.db.commit()

    async def download_and_parse_placement_report(self, location: str, profile_id: str, report_date_str: str) -> None:
        """Download and parse placement performance report."""
        from app.models.schema_v2 import AmazonAdsPlacementPerformance
        from app.services.rate_limiter import rate_limiter
        import gzip
        import json
        from datetime import datetime
        
        await rate_limiter.wait_for_token("reports")
        
        headers = await self.get_headers(profile_id=profile_id)
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(location, headers=headers)
            if resp.status_code != 200:
                logger.error(f"Failed to download placement report: {resp.text}")
                return
                
            decompressed = gzip.decompress(resp.content)
            data = json.loads(decompressed)
            
            report_date = datetime.strptime(report_date_str, "%Y%m%d").date()
            
            for row in data:
                campaign_id = str(row.get("campaignId"))
                placement = row.get("placement")
                
                if not campaign_id or not placement:
                    continue
                    
                record = self.db.query(AmazonAdsPlacementPerformance).filter(
                    AmazonAdsPlacementPerformance.profile_id == profile_id,
                    AmazonAdsPlacementPerformance.campaign_id == campaign_id,
                    AmazonAdsPlacementPerformance.placement == placement,
                    AmazonAdsPlacementPerformance.date == report_date
                ).first()
                
                if record:
                    record.impressions = row.get("impressions", 0)
                    record.clicks = row.get("clicks", 0)
                    record.spend = row.get("cost", 0.0)
                    record.sales = row.get("purchases1d", 0.0)
                    continue
                    
                db_record = AmazonAdsPlacementPerformance(
                    user_id=self.user_id,
                    profile_id=profile_id,
                    campaign_id=campaign_id,
                    date=report_date,
                    placement=placement,
                    impressions=row.get("impressions", 0),
                    clicks=row.get("clicks", 0),
                    spend=row.get("cost", 0.0),
                    sales=row.get("purchases1d", 0.0),
                    orders=row.get("purchases1d", 0)
                )
                self.db.add(db_record)
                
            self.db.commit()

    async def update_keyword_status(self, profile_id: str, keyword_id: str, state: str) -> bool:
        """Manually pause or enable a keyword in Amazon Ads (strictly rate limited)."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        try:
            await rate_limiter.wait_for_token("default")
        except AmazonAdsCircuitBreakerException:
            logger.error("Circuit breaker active, cannot update keyword")
            return False
            
        url = f"{self._get_api_url()}/v2/sp/keywords"
        headers = await self.get_headers(profile_id=profile_id)
        
        # Payload requires array of objects
        payload = [{
            "keywordId": int(keyword_id) if keyword_id.isdigit() else keyword_id,
            "state": state.lower() # API typically expects lowercase or exact match, verify docs
        }]
        
        async with httpx.AsyncClient() as client:
            resp = await client.put(url, headers=headers, json=payload)
            if resp.status_code == 429:
                from app.services.rate_limiter import AmazonAdsRateLimiter
                AmazonAdsRateLimiter.trip_circuit_breaker()
                return False
                
            if resp.status_code not in (200, 207):
                logger.error(f"Failed to update keyword status: {resp.text}")
                return False
                
            result = resp.json()
            if isinstance(result, list) and len(result) > 0:
                if result[0].get("code") == "SUCCESS":
                    return True
                else:
                    logger.error(f"Amazon returned error for keyword update: {result[0]}")
                    return False
                    
            return True

    async def add_negative_keyword(self, profile_id: str, campaign_id: str, ad_group_id: str, keyword_text: str) -> bool:
        """Add a negative exact keyword to block a bleeding search term."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        try:
            await rate_limiter.wait_for_token("default")
        except AmazonAdsCircuitBreakerException:
            logger.error("Circuit breaker active, cannot add negative keyword")
            return False
            
        url = f"{self._get_api_url()}/v2/sp/negativeKeywords"
        headers = await self.get_headers(profile_id=profile_id)
        
        try:
            c_id = int(campaign_id)
            ag_id = int(ad_group_id)
        except ValueError:
            c_id = campaign_id
            ag_id = ad_group_id
            
        payload = [{
            "campaignId": c_id,
            "adGroupId": ag_id,
            "keywordText": keyword_text,
            "matchType": "negativeExact",
            "state": "enabled"
        }]
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 429:
                from app.services.rate_limiter import AmazonAdsRateLimiter
                AmazonAdsRateLimiter.trip_circuit_breaker()
                return False
                
            if resp.status_code not in (200, 207):
                logger.error(f"Failed to add negative keyword: {resp.text}")
                return False
                
            result = resp.json()
            if isinstance(result, list) and len(result) > 0:
                if result[0].get("code") == "SUCCESS":
                    return True
                else:
                    logger.error(f"Amazon returned error for negative keyword: {result[0]}")
                    return False
                    
            return True

    async def update_campaign_bidding_placement(self, profile_id: str, campaign_id: str, placement: str, percentage: int) -> bool:
        """Update a campaign's bidding multiplier for a specific placement (Top of Search or Product Pages)."""
        from app.services.rate_limiter import rate_limiter, AmazonAdsCircuitBreakerException
        
        try:
            await rate_limiter.wait_for_token("default")
        except AmazonAdsCircuitBreakerException:
            logger.error("Circuit breaker active, cannot update bidding placement")
            return False
            
        url = f"{self._get_api_url()}/v2/sp/campaigns"
        headers = await self.get_headers(profile_id=profile_id)
        
        try:
            c_id = int(campaign_id)
        except ValueError:
            c_id = campaign_id
            
        # First, we must GET the campaign to preserve its current bidding strategy
        # For simplicity in v2, if you just send bidding it overwrites. We will just send the bidding block.
        # However, to be safe, we should fetch it. For now, assuming strategy is 'legacyForSales' if not provided.
        
        # Amazon Ads v2 bidding payload
        payload = [{
            "campaignId": c_id,
            "bidding": {
                "strategy": "legacyForSales", # default dynamic down only
                "adjustments": [
                    {
                        "predicate": placement, # "placementTop" or "placementProductPage"
                        "percentage": percentage
                    }
                ]
            }
        }]
        
        async with httpx.AsyncClient() as client:
            resp = await client.put(url, headers=headers, json=payload)
            if resp.status_code == 429:
                from app.services.rate_limiter import AmazonAdsRateLimiter
                AmazonAdsRateLimiter.trip_circuit_breaker()
                return False
                
            if resp.status_code not in (200, 207):
                logger.error(f"Failed to update bidding placement: {resp.text}")
                return False
                
            result = resp.json()
            if isinstance(result, list) and len(result) > 0:
                if result[0].get("code") == "SUCCESS":
                    return True
                else:
                    logger.error(f"Amazon returned error for bidding update: {result[0]}")
                    return False
                    
            return True
