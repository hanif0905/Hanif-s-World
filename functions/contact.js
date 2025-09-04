export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();

    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const message = (data.message || "").trim();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // JWT for Google Sheets
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const claimSet = {
      iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    };

    const enc = (obj) => btoa(JSON.stringify(obj))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const encoder = new TextEncoder();
    const keyData = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
    const key = await crypto.subtle.importKey(
      "pkcs8",
      str2ab(keyData),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    function str2ab(str) {
      const b64 = str.split("\n")
        .filter(l => !l.includes("BEGIN") && !l.includes("END"))
        .join("");
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes.buffer;
    }

    const unsignedJWT = `${enc(header)}.${enc(claimSet)}`;
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      encoder.encode(unsignedJWT)
    );
    const signedJWT = `${unsignedJWT}.${btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;

    // Get access token
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signedJWT}`
    });
    const tokenData = await tokenResp.json();
    const accessToken = tokenData.access_token;

    // Append to Google Sheet
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEETS_ID}/values/Sheet1!A:E:append?valueInputOption=RAW`;
    const body = {
      values: [[new Date().toISOString(), name, email, message, request.headers.get("user-agent") || "unknown"]]
    };

    const sheetResp = await fetch(sheetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!sheetResp.ok) {
      const errText = await sheetResp.text();
      return new Response(JSON.stringify({ error: errText }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "OK" }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
