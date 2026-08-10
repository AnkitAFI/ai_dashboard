# server_py/app/services/amazon_ads/rules_engine/rules.py
"""
Deterministic Mathematical PPC Optimization Rules & Orchestrator
1. BleederDetectorRule -> 0 orders & clicks >= threshold -> ADD_NEGATIVE_EXACT
2. WinnerDetectorRule -> orders >= threshold & ACOS <= target_acos -> ADD_KEYWORD_EXACT
3. BidOptimizerRule -> Adjust bids mathematically based on Target ACOS
4. BudgetExhaustionRule -> Detect budget capping on high ROI campaigns
"""
import json
import uuid
from typing import List, Dict, Any
from app.models.ad_models import (
    AmazonAdSearchTerm, AmazonAdTarget, AmazonAdCampaign, 
    AmazonAdAccountSetting, AmazonAdRecommendation,
    AmazonAdPromotionPipeline, AmazonAdHarvestHistory
)


class BleederDetectorRule:
    """
    1-Click Bleeder Blocker:
    Finds search terms that have wasted clicks without a single sale.
    """
    @staticmethod
    def evaluate(
        profile_id: str,
        batch_id: str,
        search_terms: List[AmazonAdSearchTerm],
        settings: AmazonAdAccountSetting
    ) -> List[AmazonAdRecommendation]:
        recs = []
        click_threshold = settings.bleeder_click_threshold if settings else 15
        
        for st in search_terms:
            if st.clicks >= click_threshold and st.orders == 0 and st.spend > 0:
                evidence = {
                    "rule": "BleederDetectorRule",
                    "clicks": st.clicks,
                    "orders": st.orders,
                    "spend": round(st.spend, 2),
                    "threshold_clicks": click_threshold,
                    "reason": f"Search term '{st.query_text}' received {st.clicks} clicks costing {st.spend:.2f} with 0 orders."
                }
                rec = AmazonAdRecommendation(
                    batch_id=batch_id,
                    profile_id=profile_id,
                    rule_type="BLEEDER",
                    target_id=st.target_id or "unknown",
                    campaign_id=st.campaign_id,
                    ad_group_id=st.ad_group_id,
                    recommended_action="ADD_NEGATIVE_EXACT",
                    current_value="NOT_BLOCKED",
                    recommended_value=st.query_text,
                    evidence_payload=json.dumps(evidence),
                    rule_version="v1.0",
                    status="GENERATED"
                )
                recs.append(rec)
        return recs


class SearchTermHarvesterRule:
    """
    Enterprise-Grade Search Term Harvester (Multi-Stage Pipeline):
    Isolates highly profitable search terms based on user-defined Promotion Pipelines.
    Graduates keywords through: Auto (Discovery) -> Broad (Testing) -> Phrase (Refining) -> Exact (Scaling).
    """
    @staticmethod
    def evaluate(
        profile_id: str,
        batch_id: str,
        search_terms: List[AmazonAdSearchTerm],
        targets: List[AmazonAdTarget],
        pipelines: List[Any], # List[AmazonAdPromotionPipeline]
        harvest_history: List[AmazonAdHarvestHistory]
    ) -> List[AmazonAdRecommendation]:
        recs = []
        
        # Build lookup for existing targets: (ad_group_id, match_type, expression)
        existing_targets_set = {
            (t.ad_group_id, t.match_type, t.expression.lower()) for t in targets 
        }
        
        # Build lookup for harvest history: (pipeline_id, dest_ad_group_id, search_term)
        harvested_set = { 
            (h.pipeline_id, h.dest_ad_group_id, h.search_term.lower()) 
            for h in harvest_history 
        }
        
        for pl in pipelines:
            if not pl.is_active:
                continue
                
            # Define the stages in order
            stages = [
                {"name": "Discovery", "ad_group": pl.discovery_ad_group_id, "next_ad_group": pl.testing_ad_group_id, "min_orders": pl.testing_min_orders, "match_type": "BROAD"},
                {"name": "Testing", "ad_group": pl.testing_ad_group_id, "next_ad_group": pl.refining_ad_group_id, "min_orders": pl.refining_min_orders, "match_type": "PHRASE"},
                {"name": "Refining", "ad_group": pl.refining_ad_group_id, "next_ad_group": pl.scaling_ad_group_id, "min_orders": pl.scaling_min_orders, "match_type": "EXACT"}
            ]
            
            for stage in stages:
                if not stage["ad_group"] or not stage["next_ad_group"]:
                    continue # Skip if this pipeline jump isn't configured
                    
                # Find search terms originating from the current stage's ad group
                stage_search_terms = [st for st in search_terms if st.ad_group_id == stage["ad_group"]]
                
                for st in stage_search_terms:
                    term_lower = st.query_text.lower()
                    
                    # 1. Did we already promote this term from this stage to the next?
                    if (pl.id, stage["next_ad_group"], term_lower) in harvested_set:
                        continue
                        
                    actual_acos = (st.spend / st.sales) if st.sales > 0 else float('inf')
                    
                    # 2. Did it hit the thresholds for the next stage?
                    if st.orders >= stage["min_orders"] and st.clicks >= pl.min_clicks and actual_acos <= pl.target_acos:
                        
                        # 3. Does it already exist in the DESTINATION as the correct match type?
                        if (stage["next_ad_group"], stage["match_type"], term_lower) in existing_targets_set:
                            continue
                            
                        # 4. If configured, does it already exist in the SOURCE as a NEGATIVE EXACT?
                        if pl.enable_auto_negative and (stage["ad_group"], "NEGATIVE_EXACT", term_lower) in existing_targets_set:
                            # Strict protection, skip if it's already negated here
                            pass
                            
                        suggested_bid = round((st.spend / st.clicks) * 1.15, 2) if st.clicks > 0 else 5.0
                        
                        evidence = {
                            "rule": "SearchTermHarvesterRule",
                            "pipeline_id": pl.id,
                            "stage_name": stage["name"],
                            "source_ad_group_id": stage["ad_group"],
                            "dest_ad_group_id": stage["next_ad_group"],
                            "dest_match_type": stage["match_type"],
                            "enable_auto_negative": pl.enable_auto_negative,
                            "orders": st.orders,
                            "clicks": st.clicks,
                            "sales": round(st.sales, 2),
                            "spend": round(st.spend, 2),
                            "actual_acos": round(actual_acos * 100, 2),
                            "target_acos": round(pl.target_acos * 100, 2),
                            "suggested_bid": suggested_bid,
                            "reason": f"Pipeline {pl.id} ({stage['name']}): '{st.query_text}' graduated to {stage['match_type']} (Orders={st.orders}, ACOS={actual_acos*100:.1f}%)."
                        }
                        
                        rec = AmazonAdRecommendation(
                            batch_id=batch_id,
                            profile_id=profile_id,
                            rule_type="HARVESTER",
                            target_id="multi_stage_promotion",
                            campaign_id=st.campaign_id,
                            ad_group_id=stage["ad_group"],
                            recommended_action="PROMOTE_SEARCH_TERM",
                            current_value="CURRENT_STAGE",
                            recommended_value=st.query_text,
                            evidence_payload=json.dumps(evidence),
                            rule_version="v3.0",
                            status="GENERATED"
                        )
                        recs.append(rec)
                        
                        # Temporarily mark harvested in memory
                        harvested_set.add((pl.id, stage["next_ad_group"], term_lower))
                    
        return recs


class BidOptimizerRule:
    """
    Mathematical Bid Optimizer:
    Adjusts keyword CPC bids based on Target ACOS ratio.
    """
    @staticmethod
    def evaluate(
        profile_id: str,
        batch_id: str,
        targets: List[AmazonAdTarget],
        target_metrics: Dict[str, Dict[str, float]],
        settings: AmazonAdAccountSetting
    ) -> List[AmazonAdRecommendation]:
        recs = []
        target_acos = settings.target_acos if settings else 0.25
        min_bid = settings.min_bid_floor if settings else 2.0
        max_bid = settings.max_bid_ceiling if settings else 150.0
        
        for t in targets:
            if t.target_type != "KEYWORD" or t.state != "ENABLED" or not t.bid:
                continue
                
            metrics = target_metrics.get(t.target_id)
            if not metrics or metrics.get("sales", 0.0) == 0:
                continue
                
            spend = metrics["spend"]
            sales = metrics["sales"]
            actual_acos = spend / sales
            current_bid = t.bid
            
            # If bleeding above 1.1x target ACOS -> reduce bid
            if actual_acos > (target_acos * 1.10):
                new_bid = round(current_bid * (target_acos / actual_acos), 2)
                new_bid = max(new_bid, min_bid)
                if new_bid < current_bid:
                    evidence = {
                        "rule": "BidOptimizerRule",
                        "actual_acos": round(actual_acos * 100, 2),
                        "target_acos": round(target_acos * 100, 2),
                        "current_bid": current_bid,
                        "recommended_bid": new_bid,
                        "reason": f"ACOS ({actual_acos*100:.1f}%) exceeds target ({target_acos*100:.1f}%). Reducing bid to restore profitability."
                    }
                    rec = AmazonAdRecommendation(
                        batch_id=batch_id,
                        profile_id=profile_id,
                        rule_type="BID_OPTIMIZE",
                        target_id=t.target_id,
                        campaign_id="unknown",
                        ad_group_id=t.ad_group_id,
                        recommended_action="ADJUST_BID",
                        current_value=str(current_bid),
                        recommended_value=str(new_bid),
                        evidence_payload=json.dumps(evidence),
                        rule_version="v1.0",
                        status="GENERATED"
                    )
                    recs.append(rec)
            
            # If highly profitable (< 0.8x target ACOS) -> increase bid to capture volume
            elif actual_acos < (target_acos * 0.80) and metrics.get("orders", 0) >= 2:
                new_bid = round(current_bid * 1.15, 2)
                new_bid = min(new_bid, max_bid)
                if new_bid > current_bid:
                    evidence = {
                        "rule": "BidOptimizerRule",
                        "actual_acos": round(actual_acos * 100, 2),
                        "target_acos": round(target_acos * 100, 2),
                        "current_bid": current_bid,
                        "recommended_bid": new_bid,
                        "reason": f"ACOS ({actual_acos*100:.1f}%) is well below target ({target_acos*100:.1f}%). Increasing bid by 15% to capture more Top-of-Search volume."
                    }
                    rec = AmazonAdRecommendation(
                        batch_id=batch_id,
                        profile_id=profile_id,
                        rule_type="BID_OPTIMIZE",
                        target_id=t.target_id,
                        campaign_id="unknown",
                        ad_group_id=t.ad_group_id,
                        recommended_action="ADJUST_BID",
                        current_value=str(current_bid),
                        recommended_value=str(new_bid),
                        evidence_payload=json.dumps(evidence),
                        rule_version="v1.0",
                        status="GENERATED"
                    )
                    recs.append(rec)
        return recs


class AdPulseRulesEngine:
    """
    Orchestrates all 4 PPC optimization rules and generates immutable versioned recommendation snapshots.
    """
    @staticmethod
    def evaluate_profile(
        profile_id: str,
        search_terms: List[AmazonAdSearchTerm],
        targets: List[AmazonAdTarget],
        target_metrics: Dict[str, Dict[str, float]],
        settings: AmazonAdAccountSetting,
        workflows: List[AmazonAdPromotionPipeline],
        harvest_history: List[AmazonAdHarvestHistory]
    ) -> List[AmazonAdRecommendation]:
        batch_id = f"batch_{uuid.uuid4().hex[:12]}"
        all_recs = []
        
        # 1. Bleeders
        all_recs.extend(BleederDetectorRule.evaluate(profile_id, batch_id, search_terms, settings))
        # 2. Harvester (replaces WinnerDetectorRule)
        all_recs.extend(SearchTermHarvesterRule.evaluate(profile_id, batch_id, search_terms, targets, workflows, harvest_history))
        # 3. Bid Optimizations
        all_recs.extend(BidOptimizerRule.evaluate(profile_id, batch_id, targets, target_metrics, settings))
        
        return all_recs
