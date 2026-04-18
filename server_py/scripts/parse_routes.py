import ast

class EndpointDetector(ast.NodeVisitor):
    def __init__(self):
        self.endpoints = []
    def visit_FunctionDef(self, node):
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute):
                if isinstance(decorator.func.value, ast.Name) and decorator.func.value.id == "app":
                    # Found an endpoint!
                    self.endpoints.append({
                        "name": node.name,
                        "path": decorator.args[0].value if decorator.args else None,
                        "start_line": node.lineno,
                        "end_line": node.end_lineno
                    })
        self.generic_visit(node)

with open("c:\\Users\\afidi\\Desktop\\dash_1\\ai_dashboard\\server_py\\Fastapi_main.py", "r", encoding="utf-8") as f:
    source = f.read()

tree = ast.parse(source)
detector = EndpointDetector()
detector.visit(tree)

print(f"Total endpoints found: {len(detector.endpoints)}")
for ep in detector.endpoints[:10]:
    print(ep)
