from dataclasses import dataclass


@dataclass
class Sentence:
    structure: str                  # chosen structure
    slot_fill: dict[str, str]       # {"A": "わたし", "B": "がくせい"}
    applied_modifiers: dict[str, str] # {"A": None, "B": "adjective"}
    particle: str                   # actual particle used
    extension: str                  # "です", "ではない", etc.
    surface: str                    # final rendered sentence
    
    
@dataclass
class Rule:
    name: str                       # e.g., "identity"
    structure: str                  # e.g., "A は B です"
    theme: list[str]                # ["identity", "classification"]
    slots: dict[str, Any]           # mapping of A/B/etc. → entities
    particles: list[str]            # e.g., ["は"]
    extensions: list[str]           # e.g., ["です", "ではない", "ですか"]
    
    
@dataclass
class Modifier:
    name: str                       # e.g., "adjective"
    probability: float              # default probability
    position: str                   # before_noun, substitute, etc.
    forms: list[str] | None = None  # optional surface forms
    particle: str | None = None     # e.g., "の" for possessive
    pattern: str | None = None      # e.g., "X の Noun"
    type: list[str] | None = None   # e.g., ["i-adj", "na-adj"]
    
@dataclass
class Entity:
    name: str                       # e.g., "person"
    semantic_match: list[str]       # categories this entity maps to
    modifiers: list[str]            # allowed modifier keys (ref → modifiers.json)
    
    

