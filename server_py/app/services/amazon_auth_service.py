import os
import logging
import httpx
from datetime import datetime, timedelta
from app.core.config import settings

logger = logging.getLogger(__name__)

class AmazonSPAPIAuth:
    def __init__(self):
        self.client_id = settings.AMAZON_LWA_CLIENT_ID
        self.client_secret = settings.AMAZON_LWA_CLIENT_SECRET
        self.role_arn = settings.AMAZON_SP_API_ROLE_ARN
        self.lwa_endpoint = "https://api.amazon.com/auth/o2/token"
        
        # Explicitly targeting the Sandbox endpoint for safety
        self.sp_api_endpoint = "https://sandbox.sellingpartnerapi-eu.amazon.com"
        
        self._access_token = None
        self._token_expiry = None

    async def get_lwa_access_token(self) -> str:
        """
        Exchanges the Client ID and Secret for a temporary LWA Access Token.
        This verifies that Amazon recognizes your Developer credentials.
        """
        if not self.client_id or not self.client_secret:
            raise ValueError("AMAZON_LWA_CLIENT_ID or AMAZON_LWA_CLIENT_SECRET is missing in your configuration.")

        if self._access_token and self._token_expiry and datetime.now() < self._token_expiry:
            return self._access_token
            
        refresh_token = os.getenv("AMAZON_LWA_REFRESH_TOKEN")
        if not refresh_token:
            raise ValueError(
                "AMAZON_LWA_REFRESH_TOKEN is missing in your .env file! "
                "To get this, click 'Authorize' on your app in the Amazon Developer Console."
            )
            
        payload = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }
        
        logger.info("Requesting LWA Access Token from Amazon Sandbox using Refresh Token...")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.lwa_endpoint, data=payload)
            
            if response.status_code != 200:
                logger.error(f"Amazon LWA Auth Failed: {response.text}")
                response.raise_for_status()
                
            data = response.json()
            self._access_token = data["access_token"]
            self._token_expiry = datetime.now() + timedelta(seconds=data["expires_in"] - 60)
            
            logger.info("Successfully retrieved Amazon LWA Access Token!")
            return self._access_token

    def get_role_arn(self) -> str:
        """Returns the AWS IAM Role ARN for SigV4 signing."""
        if not self.role_arn:
            raise ValueError("AMAZON_SP_API_ROLE_ARN is missing in your configuration.")
        return self.role_arn

    def get_signed_auth(self):
        """
        Assumes the IAM Role using STS and returns an AWSRequestsAuth object
        for SigV4 signing of requests to the Amazon Sandbox.
        """
        import boto3
        from aws_requests_auth.aws_auth import AWSRequestsAuth
        from botocore.exceptions import NoCredentialsError
        
        try:
            sts_client = boto3.client('sts')
            logger.info(f"Assuming AWS Role: {self.role_arn}")
            
            assumed_role = sts_client.assume_role(
                RoleArn=self.role_arn,
                RoleSessionName="OneClickSandboxTest",
                DurationSeconds=3600
            )
            
            credentials = assumed_role['Credentials']
            
            # The EU sandbox endpoint maps to eu-west-1 region for execute-api
            auth = AWSRequestsAuth(
                aws_access_key=credentials['AccessKeyId'],
                aws_secret_access_key=credentials['SecretAccessKey'],
                aws_token=credentials['SessionToken'],
                aws_host='sandbox.sellingpartnerapi-eu.amazon.com',
                aws_region='eu-west-1',
                aws_service='execute-api'
            )
            return auth
            
        except NoCredentialsError:
            raise ValueError(
                "AWS Credentials missing! To assume the role locally, your machine needs an AWS_ACCESS_KEY_ID "
                "and AWS_SECRET_ACCESS_KEY configured via aws configure or environment variables."
            )
        except Exception as e:
            raise ValueError(f"Failed to assume IAM Role via STS: {str(e)}")

amazon_auth_service = AmazonSPAPIAuth()
