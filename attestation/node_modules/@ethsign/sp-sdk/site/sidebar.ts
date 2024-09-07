import type { Sidebar } from 'vocs'

export const sidebar = {
  '/docs/': [
    {
      text: "Introdoction",
      items: [
        {
          text: "Getting Started",
          link: "/docs/getting-started"
        }
      ]
    },
    {
      text: "Sign Protocol Client",
      items: [
        {
          text: "Introduction",
          link: "/docs/client/introduction",
        },
        {
          text: "Create Schema",
          link: "/docs/client/create-schema"
        },
        {
          text: "Create Attestation",
          link: "/docs/client/create-attestation"
        }
      ]
    },
    {
      text: "Schema",
      items: [
        {
          text: "Introduction",
          link: "/docs/schema/introduction",
        }
      ]
    },
    {
      text: "Attestation",
      items: [
        {
          text: "Introduction",
          link: "/docs/attestation/introduction",
        }
      ]
    }
  ]
} as const satisfies Sidebar