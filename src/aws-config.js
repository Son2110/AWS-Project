// AWS Cognito Configuration
const awsConfig = {
  Auth: {
    Cognito: {
      // TODO: Thay bằng User Pool ID của bạn
      userPoolId: "ap-southeast-1_XXXXXXXXX",

      // TODO: Thay bằng App Client ID của bạn
      userPoolClientId: "1234567890abcdefghijklmnop",

      // Region của User Pool
      region: "ap-southeast-1",

      // Optional: Hosted UI domain (nếu dùng)
      // loginWith: {
      //   oauth: {
      //     domain: "smart-office.auth.ap-southeast-1.amazoncognito.com",
      //     scopes: ["email", "profile", "openid"],
      //     redirectSignIn: ["http://localhost:5173/"],
      //     redirectSignOut: ["http://localhost:5173/"],
      //     responseType: "code",
      //   },
      // },
    },
  },
};

export default awsConfig;
