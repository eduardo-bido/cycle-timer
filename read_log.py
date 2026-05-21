import json

with open(r'C:\Users\eduardo.bido\.gemini\antigravity\brain\7cde954c-29e9-4907-ac96-038d9ae7ac70\.system_generated\logs\overview.txt', 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        if 'buffer.html' in line:
            data = json.loads(line)
            print(f"Line {idx}: Step {data.get('step_index')}, Type: {data.get('type')}, Keys: {list(data.keys())}")
            if 'content' in data:
                print("Content preview:", data['content'][:200])
            if 'tool_calls' in data:
                print("Tool calls:", data['tool_calls'])
