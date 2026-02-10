import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(express.json());

const EMAIL = "jatin1258.be23@chitkarauniversity.edu.in";

// -------------> Utility functions ---------------->

const fibonacci = (n) => {
  const result = [];
  let a = 0,
    b = 1;
  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
};

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

// ----------------------------------------------------

app.get("/", (req, res) => {
  return res.send("Server is Running");
});

// ----------- Health API -------------------------->

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL,
  });
});

// ----------- Health API -------------------------->

// ----------- BFHL API ----------------------------->

app.post("/bfhl", async (req, res) => {
  try {
    const keys = Object.keys(req.body);

    // Strict: exactly ONE key
    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Exactly one key is required",
      });
    }

    const key = keys[0];
    const value = req.body[key];

    let data;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(value) || value < 0) {
          return res.status(400).json({
            is_success: false,
            message: "Invalid fibonacci input",
          });
        }
        data = fibonacci(value);
        break;

      case "prime":
        if (!Array.isArray(value))
          return res
            .status(400)
            .json({ is_success: false, message: "Prime expects an array" });

        if (!value.every((n) => Number.isInteger(n)))
          return res
            .status(400)
            .json({
              is_success: false,
              message: "Prime array must contain integers",
            });

        data = value.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(value) || value.length === 0)
          throw new Error("LCM expects non-empty array");
        data = value.reduce((acc, curr) => lcm(acc, curr));
        break;

      case "hcf":
        if (!Array.isArray(value) || value.length === 0)
          throw new Error("HCF expects non-empty array");
        data = value.reduce((acc, curr) => gcd(acc, curr));
        break;

      case "AI":
        if (typeof value !== "string") throw new Error("AI expects a string");

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: value }] }],
          },
        );

        data =
          geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text?.split(
            " ",
          )[0] || "Unknown";
        break;

      default:
        return res.status(400).json({
          is_success: false,
          message: "Invalid key",
        });
    }

    return res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      is_success: false,
      message: error.message,
    });
  }
});

// ----------------------------------------------------->

// ----------- Server ---------------------------------->

// app.listen(process.env.PORT, () => {
//   console.log(`Listening to http://localhost:${process.env.PORT}`);
// });

// ----> vercel ----------------------

export default app;


// ------------------------------------------------------>
