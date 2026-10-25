import io

path = 'src/index.css'
with io.open(path, encoding='utf-8') as f:
    content = f.read()

old = """.btn-ghost {
  @apply bg-transparent text-muted hover:text-ink hover:bg-surface;
}

.btn-primary {
  @apply bg-cta text-canvas hover:bg-cta-hover active:bg-cta-hover;
  color: rgb(var(--on-brand));
}
"""

new = """.btn-ghost {
  @apply bg-transparent text-muted hover:text-ink hover:bg-surface;
  min-h-11;
  min-width: 44px;
}

.btn-primary {
  @apply bg-cta text-canvas hover:bg-cta-hover active:bg-cta-hover;
  color: rgb(var(--on-brand));
  min-h-11;
  min-width: 44px;
}
"""

assert old in content, "pattern not found"
content = content.replace(old, new)

with io.open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("done")
