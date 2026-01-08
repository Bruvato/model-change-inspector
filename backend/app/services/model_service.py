from litellm import acompletion
import os

class ModelService:
    async def generate(self, model: str, prompt: str) -> str:
        try:
            response = await acompletion(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                timeout=30,
            )
            return response.choices[0].message["content"]
        except Exception as e:
            return f"Error: {str(e)}"

    async def compare_models(
        self, model_a: str, prompt_a: str, model_b: str, prompt_b: str
    ) -> tuple[str, str]:
        output_a = await self.generate(model_a, prompt_a)
        output_b = await self.generate(model_b, prompt_b)
        return output_a, output_b
