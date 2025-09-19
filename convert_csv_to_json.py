import pandas as pd

# Define the input and output file paths
input_file = '/Users/rafaelfelix/Projects/demos/benky-fy/datum/vocab-app.csv'
output_file = '/Users/rafaelfelix/Projects/demos/benky-fy/datum/vocab-app.json'

# Read the CSV file using pandas, skipping the first line
csv_data = pd.read_csv(input_file, skiprows=1)

# Drop the 'Unnamed: 0' column if it exists
csv_data = csv_data.loc[:, ~csv_data.columns.str.contains('^Unnamed')]

# Convert the DataFrame to JSON with each word dictionary on a single line
csv_data.to_json(output_file, orient='records', force_ascii=False)

print(f"CSV data has been converted to JSON and saved to {output_file}")
