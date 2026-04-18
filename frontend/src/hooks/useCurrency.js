import { useState, useEffect } from 'react';
import axios from 'axios';

// Module-level cache so we only call the API once per session
let _cachedCurrency = null;

/**
 * useCurrency()
 * 
 * Detects the user's location via backend IP geolocation,
 * fetches the live INR conversion rate, and returns:
 *  - symbol      : "₹" / "$" / "£" etc.
 *  - currency    : "INR" / "USD" / "GBP" etc.
 *  - locale      : "en-IN" / "en-US" etc.
 *  - rateFromINR : e.g. 0.012 for USD
 *  - countryCode : "IN" / "US" etc.
 *  - countryName : "India" / "United States" etc.
 *  - rateSource  : "live" | "fallback"
 *  - isBaseCurrency: true if user is in India (no conversion needed)
 * 
 *  formatPrice(priceINR) — converts from INR base and formats for locale
 */
const useCurrency = () => {
    const [currencyData, setCurrencyData] = useState(_cachedCurrency || {
        symbol: '₹',
        currency: 'INR',
        locale: 'en-IN',
        rateFromINR: 1.0,
        countryCode: 'IN',
        countryName: 'India',
        rateSource: 'default',
        isBaseCurrency: true,
        loading: true,
        error: null,
    });

    useEffect(() => {
        // Use cache if available
        if (_cachedCurrency) {
            setCurrencyData({ ..._cachedCurrency, loading: false });
            return;
        }

        (async () => {
            try {
                const res = await axios.get('http://127.0.0.1:5000/detect-currency', { timeout: 5000 });
                const d = res.data;
                
                const data = {
                    symbol:         d.symbol,
                    currency:       d.currency,
                    locale:         d.locale,
                    rateFromINR:    d.rate_from_inr,
                    countryCode:    d.country_code,
                    countryName:    d.country_name,
                    rateSource:     d.rate_source,
                    isBaseCurrency: d.is_base_currency,
                    loading:        false,
                    error:          null,
                };
                
                // Cache for session
                _cachedCurrency = data;
                setCurrencyData(data);
            } catch (err) {
                // On failure: keep INR as safe default
                const fallback = {
                    symbol: '₹',
                    currency: 'INR',
                    locale: 'en-IN',
                    rateFromINR: 1.0,
                    countryCode: 'IN',
                    countryName: 'India',
                    rateSource: 'fallback',
                    isBaseCurrency: true,
                    loading: false,
                    error: 'Currency detection failed. Showing base INR price.',
                };
                _cachedCurrency = fallback;
                setCurrencyData(fallback);
            }
        })();
    }, []);

    /**
     * formatPrice(priceINR)
     * Converts a base INR price to the user's local currency
     * and formats it with correct regional comma rules.
     */
    const formatPrice = (priceINR) => {
        if (typeof priceINR !== 'number') return { value: '—', display: '—' };

        const converted = priceINR * currencyData.rateFromINR;

        // Use locale-specific number formatting
        const formatted = converted.toLocaleString(currencyData.locale, {
            maximumFractionDigits: currencyData.currency === 'JPY' ? 0 : 0,
            minimumFractionDigits: 0,
        });

        return {
            value:    converted,
            display:  formatted,
            symbol:   currencyData.symbol,
            full:     `${currencyData.symbol}${formatted}`,
        };
    };

    return { ...currencyData, formatPrice };
};

export default useCurrency;
