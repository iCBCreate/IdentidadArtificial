# Revisor — Code Review

Rol: Validar PRs + branches. Quality + seguridad. Antes de merge a main.

## Checklist de Review

### Código

- [ ] Sintaxis: ¿compila? `astro check`, `npm run build`
- [ ] Naming: ¿sigue conventions? camelCase, PascalCase, kebab-case
- [ ] Comments: ¿solo en lógica no-obvia? No "este es un for" obvio
- [ ] Imports: ¿sin ciclos? ¿ordenados? (relative, absolute, external)
- [ ] Types: ¿TypeScript strict? ¿tipos bien definidos?
- [ ] Duplication: ¿reutiliza código existente o repite?

### Tests

- [ ] ¿Hay tests? (especialmente scripts AI)
- [ ] ¿Tests pasan? `npm run test`
- [ ] ¿Coverage razonable?
- [ ] ¿TDD fue proceso?

### Build

- [ ] `npm run build` pasa sin errores
- [ ] `astro check` = 0 warnings
- [ ] `npm audit` = 0 vulnerabilities
- [ ] Build time aceptable (< 30s idealmente)

### Content (si es post MDX)

- [ ] Frontmatter válido (Zod schema pasa)
- [ ] `generatedBy`, `generatedAt`, `promptBase`, `humanReviewed` presentes
- [ ] Categoría es enum válido
- [ ] Tags = lowercase, kebab-case
- [ ] Hero image existe + path relativo correcto
- [ ] OG image generada

### Seguridad

- [ ] ¿Secretos en código? ¿Tokens hardcoded? ❌
- [ ] `.dev.vars` no committeado
- [ ] `package-lock.json` revisado (nuevas deps)
- [ ] ¿API nueva? ¿Validación de input?
- [ ] ¿CORS/CSP afectado? ¿Intencional?

### Performance

- [ ] Imágenes optimizadas? (Cloudflare Images)
- [ ] JS bundle: ¿agregó mucho peso?
- [ ] Componentes pesados: ¿lazy loaded?
- [ ] OG generation: ¿razonable?

### Git

- [ ] Commits: ¿clara historia? ¿sin "fix: typo" después de big commit?
- [ ] Branch: ¿basado en main limpio?
- [ ] No merge conflicts sin resolver
- [ ] Antes de merge: squash si muchos commits de trabajo

## Patrones de Review

### PR pequeño (< 200 líneas)

- Scan rápido: sintaxis, types, tests
- Approve si está bien

### PR mediano (200-1000 líneas)

- Completo checklist
- Pedir cambios si falta
- Discutir si arquitectura es dudosa

### PR grande (> 1000 líneas)

- Arquitecto review primero
- Luego code review
- Puede requerir múltiples iteraciones

### Post nuevo

- Validar frontmatter
- Revisar ortografía (español)
- Verificar OG image
- Checks.astro pasa sin warnings

## Comentarios Eficientes

**Formato:** Una línea, accionable, específico.

Bueno:
```
L42: `user.id` puede ser null. Add guard: `user?.id ?? 'unknown'`.
```

Evitar:
```
This code might have issues with null checks. You should consider
using optional chaining to make it safer.
```

## Antes de Aprobar

- [ ] Todos los issues resueltos
- [ ] Build limpio (0 errores, 0 warnings)
- [ ] Tests pasan
- [ ] Seguridad: OK
- [ ] Performance: OK

## Rechazar Si

- ❌ Build falla
- ❌ Secretos committeados
- ❌ Vulnerabilidades no hechas
- ❌ Tests fallan o no existen (excepto en emergencias)
- ❌ Violeta naming conventions
- ❌ Arquitectura rechazada por arquitecto

## Autorización Merge

Solo después de review exitoso + approvals.

Deploy es manual: `npm run deploy` (no auto).
