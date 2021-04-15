import discord
from discord.ext import commands
import requests
import locale
import datetime
import math

locale.setlocale(locale.LC_ALL, 'en_US')

client = commands.Bot(command_prefix='.')

@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))

@client.command()
async def chart(ctx, coin, period=None):
    chart_url = requests.get(f'http://localhost:3000/{coin}/{period}').text

    embed = discord.Embed(title=f'{coin.capitalize()} price', colour=discord.Colour(0xffd700))
    embed.set_image(url=chart_url)

    await ctx.send(embed=embed)

@client.command()
async def price(ctx, coin):
    price = requests.get(f'https://api.coingecko.com/api/v3/simple/price?ids={coin}&vs_currencies=usd').json()[coin.lower()]['usd']
    last_updated = requests.get(f'https://api.coingecko.com/api/v3/simple/price?ids={coin}&vs_currencies=usd&include_last_updated_at=true').json()[coin.lower()]['last_updated_at']

    last_updated_string_date = datetime.datetime.fromtimestamp(last_updated)
    last_updated_minutes_ago = (datetime.datetime.now() - last_updated_string_date).total_seconds() / 60

    response = f'1 {coin.capitalize()} is worth {locale.currency(price, grouping=True)}\nLast updated: {last_updated_string_date.strftime("%d/%m/%Y %X")} ({math.trunc(last_updated_minutes_ago)} minutes ago)'

    await ctx.send(response)

client.run('')
