import re
import os

os.chdir('/Users/tqualls/src/scouts/philmont-crew-0618-2026')

# Guidebook to Adventure TOC mapping
guidebook_toc = {
    1: "Cover",
    2: "Mission & Vision Statement",
    3: "Table of Contents",
    4: "Commitment to Safety & Philmont Magic",
    5: "Location, Terrain & History",
    6: "Awards",
    7: "Awards (continued)",
    8: "Preparing and Training",
    9: "Physical Training",
    10: "Practice the Patrol Method",
    11: "Hiking Skills",
    12: "Organizing Your Crew",
    13: "Crew Organization (continued)",
    14: "Your Personal Equipment",
    15: "Personal Equipment (continued)",
    16: "Personal Equipment (continued)",
    17: "Equipment Provided by Crew",
    18: "Equipment Provided by Philmont",
    19: "Tips on Equipment",
    20: "Tips on Equipment (continued)",
    21: "Tips on Equipment (continued)",
    22: "Tips on Clothing",
    23: "Tips on Clothing (continued)",
    24: "Other Useful Information",
    25: "Useful Information (continued)",
    26: "Essentials for Hiking & Arriving at Philmont",
    27: "Day One at Philmont",
    28: "Day One (continued)",
    29: "Day One (continued)",
    30: "Day Two & Three at Philmont & Camping",
    31: "Camping at Philmont",
    32: "Camping (continued)",
    33: "Camping (continued)",
    34: "Bearmuda Triangle & Preserving Wilderness",
    35: "Wilderness Pledge",
    36: "Report Artifacts & Safe Camping",
    37: "Safe and Healthy Camping",
    38: "Safe Camping (continued)",
    39: "Safe Camping (continued)",
    40: "Safe Camping (continued)",
    41: "Safe Camping (continued)",
    42: "Safe Camping (continued)",
    43: "Safe Camping (continued)",
    44: "Safe Camping (continued)",
    45: "Safe Camping (continued)",
    46: "Medical Treatment",
    47: "Medical Treatment (continued)",
    48: "Program Features",
    49: "Program Features (continued)",
    50: "Program Features (continued)",
    51: "Program Features (continued)",
    52: "Program Features (continued)",
    53: "Program Features (continued)",
    54: "Program Features (continued)",
    55: "Camps and Program Features",
    56: "Philmont Museums",
    57: "Religious Services",
    58: "Final Processing at CHQ",
    59: "More Philmont Activities",
    60: "Activities (continued)",
    61: "Fall and Winter Programs",
    62: "Staff Opportunities & Training Center",
    63: "Meanings and Pronunciations",
    64: "Cavalcade Guidebook",
    65: "Cavalcade (continued)",
    66: "Cavalcade (continued)",
    67: "Cavalcade (continued)",
    68: "Cavalcade (continued)",
    69: "Cavalcade (continued)",
    70: "Cavalcade (continued)",
    71: "Cavalcade (continued)",
    72: "Cavalcade (continued)",
    73: "Index",
    74: "Index (continued)",
    75: "Index (continued)"
}

with open('2025-Guidebook-to-Adventure/2025-Guidebook-to-Adventure.md', 'r') as f:
    content = f.read()

count = 0
for page_num, topic in guidebook_toc.items():
    pattern = rf'^# Page {page_num}$'
    replacement = f'# {topic}'
    new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    if new_content != content:
        count += 1
    content = new_content

with open('2025-Guidebook-to-Adventure/2025-Guidebook-to-Adventure.md', 'w') as f:
    f.write(content)

print(f"Updated {count} page headings in Guidebook to Adventure")
