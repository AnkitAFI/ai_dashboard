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
                "can_view_recommendations": True,
                "max_visible_recommendations": 3,
                "can_apply_recommendations": False,
                "monthly_apply_limit": 0,
                "can_customize_target_acos": False,
                "allowed_target_acos_range": (0.25, 0.25),
                "can_use_automation": False,
                "allowed_automation_modes": ["manual"],
                "can_switch_client_profiles": False,
                "upsell_message": "Upgrade to Basic or Premium to unlock 1-Click Bleeder Blocking & Winner Keyword launching!"
            },
            "basic": {
                "can_view_scorecard": True,
                "can_view_recommendations": True,
                "max_visible_recommendations": 50,
                "can_apply_recommendations": True,
                "monthly_apply_limit": 15,
                "can_customize_target_acos": False,
                "allowed_target_acos_range": (0.25, 0.25),
                "can_use_automation": False,
                "allowed_automation_modes": ["manual"],
                "can_switch_client_profiles": False,
                "upsell_message": "Upgrade to Premium to unlock Custom Target ACOS Sliders & Unlimited 1-Click applies!"
            },
            "premium": {
                "can_view_scorecard": True,
                "can_view_recommendations": True,
                "max_visible_recommendations": 1000,
                "can_apply_recommendations": True,
                "monthly_apply_limit": 999999,
                "can_customize_target_acos": True,
                "allowed_target_acos_range": (0.10, 0.50),
                "can_use_automation": True,
                "allowed_automation_modes": ["manual", "semi_auto"],
                "can_switch_client_profiles": False,
                "upsell_message": None
            },
            "enterprise": {
                "can_view_scorecard": True,
                "can_view_recommendations": True,
                "max_visible_recommendations": 999999,
                "can_apply_recommendations": True,
                "monthly_apply_limit": 999999,
                "can_customize_target_acos": True,
                "allowed_target_acos_range": (0.05, 0.90),
                "can_use_automation": True,
                "allowed_automation_modes": ["manual", "semi_auto", "full_auto"],
                "can_switch_client_profiles": True,
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
