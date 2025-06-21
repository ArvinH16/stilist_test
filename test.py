from firecrawl import FirecrawlApp
from dotenv import load_dotenv
import os
import requests

load_dotenv()


# app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))

# # Scrape a website:
# scrape_result = app.scrape_url(
#     "https://www.google.com",
#     formats=["markdown", "html"],
#     include_tags=["img"],
# )
# print(scrape_result)


import asyncio
from firecrawl import AsyncFirecrawlApp

# Llama API call - moved before main() function
def call_llama_api(response, link):
    url = "https://api.llama.com/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {os.getenv('llamma_key')}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "Llama-3.3-8B-Instruct",
        "messages": [
            {
                "role": "system",
                "content": "You are an assistant that is to grab the relevant photo from a list of img components in html."
            },
            {
                "role": "user",
                "content": f"""
                Here is the link to the product: {link}
                Here is the markdown: {response}
                
                Find the main product image from the markdown above. Pick the most relevant image for the product. 
                Should be near the beginning of the markdown most of the time. If there is a size, then pick the image with the largest size. 
                
                RESPOND WITH ONLY THIS JSON FORMAT - NO OTHER TEXT:
                {{
                    "image_url": "the_image_url_here"
                }}
                """
            }
        ]
    }
    
    response = requests.post(url, headers=headers, json=data)
    print("Llama API Response:")
    print(response.json())

async def main():
    app = AsyncFirecrawlApp(api_key=os.getenv("api_key"))
    link = 'https://www.simons.com/en/women-clothing/blouses-shirts/prints/oversized-touch-of-linen-shirt--19092-216526?srsltid=AfmBOop-PZ1Xcogf4tWPWsRVySc5fGoAbP3kki_F1A1_kxreTKkTwHFYS28'
    response = await app.scrape_url(
        url=link,		
        formats= [ 'markdown' ],
        only_main_content= True,
        include_tags= [ 'img' ]
    )
    call_llama_api(response, link)

asyncio.run(main())
