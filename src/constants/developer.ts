type Brand =
  "website" | "linkedin" | "github" | "whatsapp" | "facebook" | "instagram";

export type DeveloperLink = {
  label: string;
  url: string;
  brand: Brand;
};

export const DEVELOPER = {
  privacyPolicy: "https://ahmeddoban.vercel.app/maab/privacy-policy",
  links: [
    {
      label: "Website",
      url: "https://ahmeddoban.vercel.app/",
      brand: "website",
    },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/ahmeddoban",
      brand: "linkedin",
    },
    {
      label: "GitHub",
      url: "https://github.com/AhmedDoban",
      brand: "github",
    },
    {
      label: "WhatsApp",
      url: "https://api.whatsapp.com/send/?phone=201032040389&text&app_absent=0",
      brand: "whatsapp",
    },
    {
      label: "Facebook",
      url: "https://www.facebook.com/ahmed.doban.56",
      brand: "facebook",
    },
    {
      label: "Instagram",
      url: "https://www.instagram.com/ahmeddoban/",
      brand: "instagram",
    },
  ] satisfies DeveloperLink[],
};
