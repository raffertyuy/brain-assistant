import re

with open('tests/unit/services/task-service.test.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace string literals with Quadrant enum
content = content.replace("quadrant: 'DO',", 'quadrant: Quadrant.DO,')
content = content.replace("quadrant: 'PLAN',", 'quadrant: Quadrant.PLAN,')
content = content.replace("quadrant: 'DELEGATE',", 'quadrant: Quadrant.DELEGATE,')
content = content.replace("quadrant: 'ELIMINATE',", 'quadrant: Quadrant.ELIMINATE,')

# Replace in toBe assertions
content = content.replace("toBe('DO')", 'toBe(Quadrant.DO)')
content = content.replace("toBe('PLAN')", 'toBe(Quadrant.PLAN)')
content = content.replace("toBe('DELEGATE')", 'toBe(Quadrant.DELEGATE)')
content = content.replace("toBe('ELIMINATE')", 'toBe(Quadrant.ELIMINATE)')

# Replace in function calls
content = content.replace("getTasksByQuadrant('DO')", 'getTasksByQuadrant(Quadrant.DO)')
content = content.replace("moveToQuadrant('non-existent-id', 'DO')", "moveToQuadrant('non-existent-id', Quadrant.DO)")
content = content.replace("moveToQuadrant(task.id, 'ELIMINATE')", 'moveToQuadrant(task.id, Quadrant.ELIMINATE)')
content = content.replace("moveToQuadrant(task.id, 'PLAN')", 'moveToQuadrant(task.id, Quadrant.PLAN)')
content = content.replace("moveToQuadrant(task.id, 'DELEGATE')", 'moveToQuadrant(task.id, Quadrant.DELEGATE)')
content = content.replace("moveToQuadrant(task.id, 'DO')", 'moveToQuadrant(task.id, Quadrant.DO)')

with open('tests/unit/services/task-service.test.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed all Quadrant enum references')
