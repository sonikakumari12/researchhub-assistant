from groq import Groq
from backend.utils.groq_client import GroqConfig

class GroqWrapper:
    '''Responsible only for communicating with Groq API.'''
    def __init__(self, config: GroqConfig):
        self._config = config
        self._client = Groq(api_key=config.api_key)

        self._validate_config()

    def _validate_config(self) -> None:
        if not 0 <= self._config.temperature <= 1:
            raise ValueError("Temperature must be between 0 and 1")

        if not 0 < self._config.top_p <= 1:
            raise ValueError("top_p must be between 0 and 1")

        if self._config.max_tokens <= 0:
            raise ValueError("max_tokens must be greater than 0")

    def generate_response(self, prompt: str) -> str:
        if not isinstance(prompt, str):
            raise TypeError("Prompt must be a string")

        if not prompt.strip():
            raise ValueError("Prompt cannot be empty")

        try:
            response = self._client.chat.completions.create(
                model=self._config.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=self._config.temperature,
                max_tokens=self._config.max_tokens,
                top_p=self._config.top_p,
            )

            return response.choices[0].message.content

        except Exception as e:
            raise RuntimeError(f"Groq API call failed: {e}") from e
