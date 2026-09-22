# Arquitectura técnica y separación frontend/backend

Consultar primero la [decisión de stack](decisiones/0001-stack-y-plataformas.md), el [AGENTS general](../AGENTS.md) y el plan del módulo. Esta guía concreta las carpetas de implementación sin alterar las reglas de negocio.

## 1. Flujo del sistema

```text
Flutter / Dart (Android, iOS; Windows en segunda fase)
        |
        | HTTPS + API REST /api/v1 + JSON documentado en OpenAPI
        v
NestJS / TypeScript (módulos de plataforma, inventario, promociones y ventas)
        |
        | TypeORM: una conexión transaccional compartida por operación
        v
PostgreSQL (datos, movimientos y eventos pendientes)
        |
        | proceso de eventos después del commit
        v
Centro de Avisos y adaptadores de notificaciones de cada plataforma
```

El cliente nunca se conecta directamente a PostgreSQL. El servidor calcula descuentos, valida permisos, descuenta stock y confirma operaciones. Reutilizar el frontend entre sistemas no traslada esas decisiones a los dispositivos.

## 2. Carpetas y composición

```text
app/
  frontend/                 # ejecutable Flutter: main, composición y runners
  backend/                  # ejecutable NestJS: arranque y conexión a PostgreSQL
compartido/
  frontend/                 # paquete Dart: diseño, cliente API y puertos de dispositivo
  backend/                  # paquete TypeScript: transacción, errores y tipos comunes
modulos/<modulo>/
  AGENTS.md
  plan.md
  frontend/                 # paquete Flutter del integrante
    lib/src/
      presentacion/         # pantallas, componentes y view models
      datos/                # repositorios cliente, servicios HTTP y DTO
      dominio/              # modelos de presentación sin reglas financieras duplicadas
    test/
  backend/                  # paquete NestJS del integrante
    src/
      dominio/              # reglas propias, sin ORM ni widgets
      aplicacion/           # casos de uso y puertos
      infraestructura/      # entidades, repositorios y adaptadores
      interfaz/             # controladores, validación y DTO de la API
    test/
base-datos/migraciones/     # migraciones coordinadas de todos los módulos
docs/contratos/             # OpenAPI y contratos internos de servicio
```

Ahora se crean las guías `README.md` de esas carpetas. Código, manifiestos, runners y dependencias se crearán durante E1-02 y las tareas de cada área. No se deben confundir las carpetas documentadas con paquetes ya compilables.

Los módulos conservarán sus cuatro `AGENTS.md` como instrucciones heredadas tanto por `frontend/` como por `backend/`. El integrante 1 coordina las carpetas de arranque y compartidas. Un cambio en ellas también sigue sus reglas locales por mandato del AGENTS general.

En E1-02 configurar un workspace de paquetes Dart con resolución compartida y paquetes locales TypeScript mediante npm workspaces. Declarar rutas explícitas y nombres de paquete válidos; los guiones de las carpetas no obligan a usar el mismo nombre en un paquete Dart. No publicar estos paquetes internos. [Workspaces de Dart](https://dart.dev/tools/pub/workspaces) y [workspaces de npm](https://docs.npmjs.com/cli/using-npm/workspaces/).

Cada paquete expondrá una entrada pública. No importar archivos internos de otro módulo por rutas relativas para saltarse su contrato. La composición de aplicaciones conecta los módulos; evitar dependencias circulares y una API separada por integrante.

## 3. Contrato y precisión

- Identificadores y fechas tienen representación explícita; las fechas de intercambio incluyen zona u offset inequívoco.
- Dinero y cantidades decimales viajan como cadenas, por ejemplo `"150.00"` y `"0.125"`. Validar formato, límites y escala antes de usarlos.
- PostgreSQL utiliza `numeric` con precisión/escala documentadas en la migración. El backend usa decimal.js sin pasos intermedios por `number`.
- El cliente conserva el valor exacto recibido y lo formatea para la presentación. No vuelve a decidir promociones, consumos ni redondeos de cobro.
- Los DTO y OpenAPI son el contrato público; las entidades ORM no se serializan directamente al cliente.
- Mantener errores estructurados para permisos, stock insuficiente, cotización obsoleta e idempotencia. El idioma de un mensaje no se utiliza como código de error.

## 4. Transacciones y procesos

Ventas coordina cobro y cancelación mediante un `QueryRunner` de TypeORM y entrega su `EntityManager` a los adaptadores que lo necesitan. Todos los cambios de orden, movimientos y eventos usan ese mismo contexto; un repositorio global por fuera de él rompería la atomicidad. Un puerto común encapsula el mecanismo para que el dominio no dependa de TypeORM. [Transacciones en NestJS con TypeORM](https://docs.nestjs.com/techniques/database#typeorm-transactions).

Adquirir bloqueos de ingredientes en orden estable y validar versiones de receta/precio/promoción según el contrato. Definir y probar el aislamiento concreto en E1-02/E4-04. Los reintentos técnicos conservan la identidad de operación y no aceptan silenciosamente otro importe.

Procesar notificaciones pendientes y transiciones de promociones en un proceso del mismo backend, con control de reclamación para que dos instancias no dupliquen el trabajo. No exigir Redis, un broker o microservicios para el MVP. Si se añaden posteriormente por una necesidad medida, conservar las garantías de la bandeja transaccional.

## 5. Preparación multiplataforma

La presentación toma decisiones según espacio y capacidades, no solo según el nombre del sistema. Diseñar componentes que admitan tacto, teclado y ratón. En una ventana amplia podrán usarse paneles de lista/detalle y navegación lateral conservando la composición, tipografía e iconografía acordadas. [Diseño adaptable en Flutter](https://docs.flutter.dev/ui/adaptive-responsive).

Definir puertos para sesión segura, notificaciones, impresión, enlaces y ciclo de vida. Cada plugin queda dentro de un adaptador del destino. Una función móvil no disponible en Windows no debe impedir abrir el catálogo o consultar ventas. La ausencia temporal de una capacidad se declara en la matriz y se resuelve en la fase PC, no se oculta como una función terminada.

Preparar una matriz por dependencia: versión, plataformas declaradas, plataformas comprobadas, licencia, responsable y alternativa. Verificar especialmente notificaciones y almacenamiento seguro. Un servidor capaz de enviar push móvil no implica que Windows reciba esos avisos con el mismo plugin.

## 6. Segunda fase: aceptación de Windows

Estos criterios PC no sustituyen los 35 CA del MVP móvil. Las tareas asociadas aparecen al final de cada plan y comienzan pendientes.

| Criterio | Entrega esperada | Tarea responsable |
| --- | --- | --- |
| PC-01 | App Windows instalable, sesión segura, navegación adaptable, teclado/ratón, conexión a la misma API y capacidades de notificación/impresión documentadas y verificadas. | E1-12 |
| PC-02 | Catálogo, recetas, inventario y alertas utilizables en ventanas amplias y reducidas, con el mismo saldo que móvil. | E2-11 |
| PC-03 | Administración de promociones desde PC conserva vigencias y genera los mismos resultados de servidor que móvil. | E3-10 |
| PC-04 | Venta y cancelación desde móvil y Windows comparten stock, historial e idempotencia; reportes, comprobantes y avisos funcionan en el destino PC. | E4-12 |

Para PC-01, no presentar una notificación local mientras la app está abierta como equivalente a avisar fuera de la aplicación. Seleccionar y probar el mecanismo Windows adecuado, o dejar expresamente pendiente esa capacidad y su criterio antes de cerrar la fase PC. macOS/Linux no quedan entregados por haber probado Windows.

## 7. Auditoría técnica

Mantener evidencia de análisis/compilación Dart y TypeScript, contratos, pruebas PostgreSQL y plataformas realmente ejecutadas. Una implementación de frontend no valida reglas del servidor; una prueba de API no valida interacción táctil o con teclado. Aplicar el proceso por tarea del AGENTS general y registrar «no ejecutado» cuando aún no se disponga del entorno.
