import { Amplify } from "aws-amplify";

// Type definition for Amplify configuration
type AmplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: string;
      userPoolClientId: string;
      loginWith: {
        email: boolean;
        phone: boolean;
        oauth: {
          domain: string;
          scopes: string[];
          redirectSignIn: string[];
          redirectSignOut: string[];
          responseType: 'code';
          providers: string[];
        };
      };
      signUpVerificationMethod: 'code';
      userAttributes: {
        email: { required: boolean };
        phone_number: { required: boolean };
      };
    };
  };
};

// Production - You'll need to replace these with your actual Cognito values
const USER_POOL_ID = "ap-southeast-2_S2onAc0cG";
const USER_POOL_CLIENT_ID = "3eaot0e23e3qe91mgi594errtm";
const DOMAIN = 'ap-southeast-2s2onac0cg.auth.ap-southeast-2.amazoncognito.com';
// Development - You'll need to replace these with your actual Cognito values
const DEV_USER_POOL_ID = "ap-southeast-2_4dAoy4nk3";
const DEV_USER_POOL_CLIENT_ID = "4ckov1pg8sc912ae8sjvkc4js1";
const DEV_DOMAIN = 'ap-southeast-24daoy4nk3.auth.ap-southeast-2.amazoncognito.com';

const isDevelopment = true;

// Development configuration
const devConfig: AmplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: DEV_USER_POOL_ID,
      userPoolClientId: DEV_USER_POOL_CLIENT_ID,
      loginWith: {
        email: true,
        phone: false,
        oauth: {
          domain: DEV_DOMAIN,
          scopes: ['openid', 'email', 'profile', 'phone', 'aws.cognito.signin.user.admin'],
          redirectSignIn: ['RealXstate://', 'myapp://'],
          redirectSignOut: ['RealXstate://', 'myapp://'],
          responseType: 'code',
          providers: ['Google', 'Apple'],
        }
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
        phone_number: {
          required: false,
        },
      },
    },
  },
};

// Production configuration
const prodConfig: AmplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: USER_POOL_ID,
      userPoolClientId: USER_POOL_CLIENT_ID,
      loginWith: {
        email: true,
        phone: false,
        oauth: {
          domain: DOMAIN,
          scopes: ['openid', 'email', 'profile', 'phone', 'aws.cognito.signin.user.admin'],
          redirectSignIn: ['RealXstate://', 'myapp://'],
          redirectSignOut: ['RealXstate://', 'myapp://'],
          responseType: 'code',
          providers: ['Google', 'Apple'],
        }
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
        phone_number: {
          required: false,
        },
      },
    },
  },
};

// Use development config if in development mode, otherwise use production config
const config = isDevelopment ? devConfig : prodConfig;

console.log(`🔧 RealXstate Amplify Configuration: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);

Amplify.configure(config as any);
