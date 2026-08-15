// src/services/currencyService.ts

interface ExchangeRateResponse {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

// ------------------------------------------------------------
// USD → GHS
// ------------------------------------------------------------

export const convertUsdToGhs = async (
  usdAmount: number
): Promise<{
  usdAmount: number;
  ghsAmount: number;
  rate: number;
  rateDate: string;
}> => {

  if (!Number.isFinite(usdAmount) || usdAmount <= 0) {
    throw new Error("Invalid USD amount");
  }

  const response = await fetch(
    "https://api.frankfurter.dev/v2/rate/USD/GHS"
  );

  if (!response.ok) {
    throw new Error(
      `Unable to retrieve USD/GHS exchange rate`
    );
  }

  const data =
    await response.json() as ExchangeRateResponse;

  if (
    !data.rate ||
    !Number.isFinite(data.rate) ||
    data.rate <= 0
  ) {
    throw new Error(
      "Invalid USD/GHS exchange rate"
    );
  }

  // Convert USD → GHS
  const ghsAmount =
    Math.round(
      usdAmount * data.rate * 100
    ) / 100;


  return {
    usdAmount,
    ghsAmount,
    rate: data.rate,
    rateDate: data.date
  };

};