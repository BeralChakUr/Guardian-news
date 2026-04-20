"""UTF-8 text cleaning utilities to fix mojibake encoding issues"""
import html
import unicodedata


_MOJIBAKE_FIXES = {
    "Ã©": "é", "Ã¨": "è", "Ãª": "ê", "Ã«": "ë",
    "Ã ": "à", "Ã¢": "â", "Ã¤": "ä",
    "Ã¹": "ù", "Ã»": "û", "Ã¼": "ü",
    "Ã®": "î", "Ã¯": "ï", "Ã´": "ô",
    "Ã§": "ç", "Å\"": "œ", "Ã¦": "æ",
    "â": "'", "â": "–", "â": "—",
    "â": '"', "â": '"',
    "Ã‰": "É", "Ãˆ": "È", "ÃŠ": "Ê",
    "Ã€": "À", "Ã‚": "Â",
    "Ã\"": "Ô", "Ã›": "Û",
    "Ã‡": "Ç",
    "ï¿œ": "", "ï»¿": "", "\ufffd": "",
    "Â ": " ", "Â": "",
}


def clean_utf8_text(text: str) -> str:
    """Clean and normalize UTF-8 text to fix encoding issues."""
    if not text:
        return ""
    try:
        text = html.unescape(text)
        for bad, good in _MOJIBAKE_FIXES.items():
            text = text.replace(bad, good)

        # Try to fix double-encoded UTF-8
        try:
            decoded = text.encode("latin-1").decode("utf-8")
            if decoded != text:
                text = decoded
        except (UnicodeDecodeError, UnicodeEncodeError):
            pass

        try:
            decoded = text.encode("cp1252").decode("utf-8")
            if decoded != text and "ï¿" not in decoded:
                text = decoded
        except (UnicodeDecodeError, UnicodeEncodeError):
            pass

        # Clean remaining replacement chars
        text = text.replace("\ufffd", "").replace("ï¿œ", "")
        text = unicodedata.normalize("NFC", text)
        text = "".join(c for c in text if ord(c) >= 32 or c in "\n\r\t")
        return text.strip()
    except Exception:
        return text
