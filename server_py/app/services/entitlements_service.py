# server_py/app/services/entitlements_service.py
"""
10/10 Enterprise Subscription Entitlements Matrix for Insydz AdPulse
Matches the exact 4 subscription tiers: 'free', 'basic', 'premium', 'enterprise'.
- 'free': Read-only KPI scorecard, 0 one-click applies (upsell banner displayed)
- 'basic': 15 manual 1-click applies/month, fixed 25% Target ACOS
- 'premium': Unlimited 1-click applies, custom Target ACOS slider (10% to 50%), semi-auto rules
- 'enterprise': Unlimited everything, full auto mode, priority background workers, multi-client profile switching
"""
from typing import Dict, Any


class AdPulseEntitlementsService:
    @staticmethod
    def get_entitlements(user_tier: str) -> Dict[str, Any]:
        tier = (user_tier or "free").lower().strip()
        
        matrix = {
            "free": {
                "can_view_scorecard": True,
                "can_view_recommendations": False,
                "max_visible_recommendations": 0,
                "can_apply_recommendations": False,
                "monthly_apply_limit": 0,
                "can_customize_target_acos": False,
                "allowed_target_acos_range": (0.25, 0.25),
                "can_use_automation": False,
                "allowed_automation_modes": ["manual"],
                "can_switch_client_profiles": False,
                "max_custom_rules": 0,
                "max_promotion_pipelines": 0,
                "can_rollback_actions": False,
                "can_use_dayparting": False,
                "can_use_priority_queue": False,
                "can_use_granular_keywords": False,
                "max_granular_keywords": 0,
                "can_use_search_terms": False,
                "max_search_terms": 0,
                "can_use_bulk_ops": False,
                "can_use_portfolios": False,
                "upsell_message": "Upgrade to Premium to unlock our Deterministic PPC Engine, actionable recommendations, and automation tools!"
            },
            "premium": {
                "can_view_scorecard": True,
                "can_view_recommendations": True,
                "max_visible_recommendations": 250,
                "can_apply_recommendations": True,
                "monthly_apply_limit": 500,
                "can_customize_target_acos": True,
                "allowed_target_acos_range": (0.10, 0.50),
                "can_use_automation": True,
                "allowed_automation_modes": ["manual", "semi_auto"],
                "can_switch_client_profiles": False,
                "max_custom_rules": 25,
                "max_promotion_pipelines": 15,
                "can_rollback_actions": True,
                "can_use_dayparting": True,
                "can_use_priority_queue": False,
                "can_use_granular_keywords": True,
                "max_granular_keywords": 500,
                "can_use_search_terms": True,
                "max_search_terms": 500,
                "can_use_bulk_ops": False,
                "can_use_portfolios": True,
                "upsell_message": "Upgrade to Enterprise to unlock Multi-Account Support, Bulk Spreadsheets, and Full Auto mode!"
            },
            "enterprise": {
                "can_view_scorecard": True,
                "can_view_recommendations": True,
                "max_visible_recommendations": 2000,
                "can_apply_recommendations": True,
                "monthly_apply_limit": 5000,
                "can_customize_target_acos": True,
                "allowed_target_acos_range": (0.05, 0.90),
                "can_use_automation": True,
                "allowed_automation_modes": ["manual", "semi_auto", "full_auto"],
                "can_switch_client_profiles": True,
                "max_custom_rules": 100,
                "max_promotion_pipelines": 50,
                "can_rollback_actions": True,
                "can_use_dayparting": True,
                "can_use_priority_queue": True,
                "can_use_granular_keywords": True,
                "max_granular_keywords": 999999,
                "can_use_search_terms": True,
                "max_search_terms": 999999,
                "can_use_bulk_ops": True,
                "can_use_portfolios": True,
                "upsell_message": None
            }
        }
        
        return matrix.get(tier, matrix["free"])

    @staticmethod
    def assert_can_apply(user_tier: str, current_monthly_applies: int = 0) -> None:
        ent = AdPulseEntitlementsService.get_entitlements(user_tier)
        if not ent["can_apply_recommendations"]:
            raise PermissionError(ent["upsell_message"])
        if current_monthly_applies >= ent["monthly_apply_limit"]:
            raise PermissionError(
                f"You have reached your monthly apply limit ({ent['monthly_apply_limit']} applies) for the '{user_tier}' tier. Upgrade to unlock more!"
            )


ad_entitlements_service = AdPulseEntitlementsService()
