import argparse
from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel

parser = argparse.ArgumentParser(description='Run Agent.')
parser.add_argument('--token', type=str, required=True, help='HF token')
args = parser.parse_args()

token = args.token

model = HfApiModel(token=token)
agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=model)

agent.run("How many seconds would it take for a leopard at full speed to run through Pont des Arts?")