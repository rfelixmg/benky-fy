import json
import random
import pandas as pd

# Load core structures
with open('/Users/rafaelfelix/Projects/demos/benky-fy/tmp/core.json', 'r', encoding='utf-8') as f:
    core_data = json.load(f)

# Load vocabulary
vocab_df = pd.read_json('/Users/rafaelfelix/Projects/demos/benky-fy/tmp/vocab.json', orient='records')

# Normalize columns to lower-case
vocab_df['category'] = vocab_df['category'].str.lower()

# Load verbs from JSON
# with open('/Users/rafaelfelix/Projects/demos/benky-fy/tmp/verbs.json', 'r', encoding='utf-8') as f:
verbs_data = pd.read_json('/Users/rafaelfelix/Projects/demos/benky-fy/tmp/verbs.json', orient='records')

    # verbs_data = json.load(f)
print(verbs_data.iloc[0])

print("================================================")

# Function to generate a random sentence
def generate_sentence(num_sentences=1, priority_group='p0', use_extensions=True, use_pragmatics=True):
    for _ in range(num_sentences):
        # Pick a random core structure
        core_structure = random.choice(core_data['core_structures'])
        structure = core_structure['structure']
        slots = core_structure['slots']

        # Fill slots with vocabulary
        filled_slots = {}
        for slot, pos_list in slots.items():
            print(f"{slot=} | {pos_list=}")
            
            if 'verb' in pos_list:
                # Filter verbs by grammatical type
                filtered_verbs = [verb for verb in verbs_data if verb['grammatical_type'].lower() in [p.lower() for p in pos_list]]
                print("Samples: ", len(filtered_verbs))
                if filtered_verbs:
                    chosen_verb = random.choice(filtered_verbs)
                    filled_slots[slot] = chosen_verb['hiragana']
                    structure = structure.replace(slot, chosen_verb['hiragana'])
            else:
                # Filter vocabulary by category and priority group using DataFrame queries
                filtered_vocab = vocab_df[(vocab_df['category'].isin([p.lower() for p in pos_list])) & (vocab_df['priority_group'] == priority_group)]
                print("Samples: ", len(filtered_vocab))
                if not filtered_vocab.empty:
                    chosen_word = filtered_vocab.sample(1).iloc[0]
                    filled_slots[slot] = chosen_word['kana']
                    structure = structure.replace(slot, chosen_word['kana'])

        # Optionally add extensions
        if use_extensions and 'extensions' in core_structure:
            extensions = core_structure['extensions']
            if extensions:
                structure += ' ' + random.choice(extensions)

        # Optionally add pragmatics
        if use_pragmatics:
            pragmatics = core_data.get('pragmatics', [])
            if pragmatics:
                structure += ' ' + random.choice(pragmatics)['ending']

        # Print the generated sentence
        print(f"Generated Sentence: {structure}")
        print(f"Structure Used: {core_structure['structure']}")
        print(f"Filled Slots: {filled_slots}")

# Example usage
if __name__ == "__main__":
    generate_sentence()
