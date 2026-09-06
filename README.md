# TraceProStock - GABRIEL GOMEZ CORREA

**TALL DE DESARROLLO WEB Y MÓVIL**  
TALLER

**NRC:** 2426

**Curso:** APTC106

**Sección:** 550

Sistema de inventario con panel web en Django y prototipo híbrido en Ionic React.

## Accesos de prueba

Administrador:
- Usuario: admin
- Clave: admin

Operario:
- Usuario: operario
- Clave: operario

## Clonar repositorio y ejecutar

### Windows

```bash
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
py manage.py migrate
py manage.py runserver
```

### Linux / Mac

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Prototipo híbrido Ionic

La aplicación ubicada en `mobile/` permite:

- Iniciar sesión como administrador u operario.
- Consultar el resumen y estado del inventario.
- Crear, editar y eliminar productos como administrador.
- Registrar entradas y salidas de stock.
- Revisar alertas e historial de movimientos.
- Utilizar la interfaz en escritorio o dispositivos móviles.

Los datos del prototipo se conservan en el almacenamiento local del navegador.

### Ejecutar en desarrollo

```bash
cd mobile
npm install
npm run dev
```

### Generar versión para despliegue

```bash
cd mobile
npm install
npm run build
```

La versión compilada queda disponible en `mobile/dist/`. El proyecto incluye configuración de Capacitor para su integración como aplicación híbrida.
