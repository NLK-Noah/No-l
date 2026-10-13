with open('menu.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find where the "Nouvelles Activités" buttons are and add the new ones
target = '</div>\n  </div>' # This targets the end of the button container
# Since we have multiple similar tags, let's be more precise. 
# We'll add the buttons before the footer.

injection = '''
    <a href="livre_or.html" class="btn-noel">📖 Livre d\'Or</a>
    <a href="profile.html" class="btn-noel">👤 Mon Profil</a>
'''

# Look for the "Nouvelles Activités" text and append buttons after the last current one
if "✨ Nouvelles Activités ✨" in content:
    # Find the last btn-noel in that section
    import re
    matches = list(re.finditer(r'<a href="[^"]+" class="btn-noel">.*?</a>', content))
    if matches:
        last_match_end = matches[-1].end()
        new_content = content[:last_match_end] + injection + content[last_match_end:]
        with open('menu.html', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully added links")
