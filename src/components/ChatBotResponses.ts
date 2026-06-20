// frontend/src/components/ChatBotResponses.ts
export interface BotResponseCategory {
  [key: string]: string[];
}

export interface BotResponses {
  [key: string]: BotResponseCategory;
}

export const botResponses: BotResponses = {
  // ===================== CUENTA Y ACCESO =====================
  'cuenta': {
    'crear_cuenta': [
      '¡Es muy sencillo! Sigue estos pasos:\n1. Toca el ícono de "Más" en la barra inferior.\n2. Pulsa en "Iniciar sesión".\n3. Elige "Registrarte" debajo del formulario.\n4. Rellena tus datos y ¡listo!',
      'Para registrarte: Primero debe presionar en Más > Iniciar sesión > Registrarte. Solo necesitas tu nombre, un email y una contraseña segura.'
    ],
    'recuperar_contraseña': [
      'Si olvidaste tu clave, haz esto:\n1. Diríjase a "Iniciar sesión" (en la pestaña Más).\n2. Toca "¿Olvidaste tu contraseña?".\n3. Ingresa tu email y te enviaremos un enlace para restablecerla.',
      'Puede recuperar su acceso en la pantalla de Login presionando en "¿Olvidaste tu contraseña?". Revisa tu correo después de hacerlo.'
    ],
    'cambiar_contraseña': [
      'Para cambiar tu clave:\n1. Acceda a la pestaña "Más".\n2. Toca "Configuración".\n3. Entra en "Seguridad y Privacidad" > "Cambiar contraseña".\n4. Ingresa tu clave actual y la nueva.',
      'Cambie su clave ingresando a: Más > Configuración > Seguridad. Es importante tener tu contraseña actual a mano.'
    ],
    'verificar_email': [
      'Si no has verificado tu email, busca el mensaje que te enviamos al registrarte. Si no te llegó, puede solicitar uno nuevo al intentar iniciar sesión.',
      'La verificación es clave para comprar. Revisa tu bandeja de entrada (o SPAM) y pulse el enlace de confirmación.'
    ]
  },

  // ===================== COMPRAS Y CARRITO =====================
  'compras': {
    'hacer_compra': [
      'Para comprar algo:\n1. Busca el producto que te gusta.\n2. Toca "Añadir al carrito".\n3. Diríjase a la pestaña "Carrito" en la barra inferior.\n4. Pulsa "Proceder al pago" y sigue las instrucciones.',
      'Es muy fácil: añada lo que quiera al Carrito, acceda a dicha sección y toque en "Pagar". Yo le guiaré con el envío y el método de pago.'
    ],
    'ver_pedidos': [
      'Para ver qué ha comprado:\n1. Primero debe presionar en la pestaña "Más".\n2. Ingrese a "Mis compras".\nAhí verás el estado de todos tus pedidos actuales y pasados.',
      'Consulte sus pedidos en: Más > Mis compras. Podrá ver si ya se enviaron o están en camino.'
    ],
    'carro': [
      'Tu carrito está en la barra inferior. Desde ahí puede cambiar las cantidades o eliminar productos deslizando hacia la izquierda.',
      'En la pestaña "Carrito" puede ver el total de su compra antes de confirmar el pago.'
    ],
    'favoritos': [
      'Puede guardar productos tocando el corazón. Para verlos, debe ir a la pestaña "Favoritos" en la barra de navegación inferior.',
      'Tus artículos preferidos le esperan en la pestaña "Favoritos" para que no los pierda de vista.'
    ]
  },

  // ===================== VENTAS Y PRODUCTOS =====================
  'ventas': {
    'publicar_producto': [
      '¡Vende lo que ya no uses!\n1. Ubique la pestaña de "Más".\n2. Toca en "Mis productos".\n3. Pulsa el botón "+" arriba a la derecha.\n4. Sube fotos, ponle nombre, precio y descripción.',
      'Para vender: Diríjase a Más > Mis productos > Botón "+". Asegúrese de que las fotos sean claras para vender más rápido.'
    ],
    'gestionar_productos': [
      'Para editar o borrar tus ventas:\n1. Debe ir a Más > Mis productos.\n2. Toca los tres puntos de un producto para editarlo o pausarlo.',
      'En "Mis productos" puede controlar todo su inventario: cambiar precios, fotos o descripciones.'
    ],
    'ver_ventas': [
      'Para ver quién te ha comprado:\n1. Navegue hacia la pestaña "Más".\n2. Toca en "Mis ventas".\nAhí verás los pedidos que debes preparar y enviar.',
      'Tus ventas están en: Más > Mis ventas. ¡Suerte con tus negocios!'
    ],
    'reportes_vendedor': [
      'Si desea ver sus estadísticas:\n1. Seleccione la pestaña de "Más".\n2. Entra en "Centro de Reportes".\nPodrá ver sus ganancias y descargar archivos en PDF.',
      'En el Centro de Reportes (Más > Centro de Reportes) tiene gráficas de tus ventas y descarga de documentos.'
    ]
  },

  // ===================== CONFIGURACIÓN Y TEMA =====================
  'configuracion': {
    'modo_oscuro': [
      'Para cambiar el tema:\n1. Primero debe presionar en "Más".\n2. Toca en "Configuración".\n3. En la sección "Apariencia", activa o desactiva el "Modo oscuro".',
      'Elige tu estilo ingresando a: Más > Configuración > Apariencia. ¡El modo oscuro es genial para la noche!'
    ],
    'ajustes_notificaciones': [
      'Para controlar tus avisos:\n1. Diríjase a Más > Configuración.\n2. Busca la sección "Notificaciones".\nAllí puedes elegir si quieres correos, alertas push o sonidos.',
      'Gestione sus avisos en: Más > Configuración > Notificaciones. Así solo le molestamos con lo importante.'
    ],
    'limpiar_cache': [
      'Si la app va lenta:\n1. Acceda a Más > Configuración.\n2. Busca "Cuenta y Datos".\n3. Toca en "Limpiar caché". Esto liberará espacio sin borrar tu cuenta.',
      'Puede liberar espacio en: Más > Configuración > Limpiar caché. Es como darle un respiro a la aplicación.'
    ]
  },

  // ===================== DIRECCIONES Y PAGOS =====================
  'perfil': {
    'gestionar_direcciones': [
      'Para configurar dónde recibes tus pedidos:\n1. Toca en "Más".\n2. Ingrese a su "Perfil" (presionando su nombre arriba).\n3. Busca "Direcciones de Envío" para añadir o cambiar una.',
      'Configure su entrega en: Más > Perfil > Direcciones de Envío. ¡Asegúrese de que el código postal sea correcto!'
    ],
    'metodos_pago': [
      'Para guardar tus tarjetas o bancos:\n1. Diríjase a Más > Perfil.\n2. Toca en "Métodos de Pago".\n3. Podrás añadir tarjetas de crédito, débito o datos para transferencia.',
      'Tus tarjetas se guardan en: Más > Perfil > Métodos de Pago. Usamos cifrado de seguridad máximo.'
    ],
    'editar_perfil': [
      'Para cambiar tu nombre o foto:\n1. Ubique la pestaña "Más".\n2. Ingrese a "Perfil" y presione el botón "Editar perfil".\nNo olvides darle a "Guardar" al terminar.',
      'Personaliza tu cuenta en: Más > Perfil > Editar perfil. ¡Sube una foto bonita!'
    ]
  },

  // ===================== ADMINISTRACIÓN (SOLO ADMINS) =====================
  'admin': {
    'dashboard_admin': [
      'Si eres administrador:\n1. Debe ir a "Más".\n2. Seleccione "Panel de Control".\nAllí verás el resumen de usuarios, ventas y productos de todo el sistema.',
      'Los administradores tienen acceso al Panel de Control en el menú Más para ver métricas globales.'
    ],
    'gestionar_usuarios': [
      'Para dar de baja o promover usuarios: Primero debe presionar en Admin > Usuarios. Puedes buscarlos por nombre o correo.',
      'En el Panel de Admin puede gestionar a todos los miembros de la comunidad.'
    ],
    'ordenes_globales': [
      'Para ver todos los pedidos del sistema: Navegue hacia Admin > Pedidos. Podrá filtrar por estado o fecha.',
      'Como admin, puede supervisar cada orden en: Panel de Control > Pedidos.'
    ]
  },

  // ===================== NATURALES Y SOPORTE =====================
  'naturales': {
    'saludo': [
      '¡Hola! Soy Juli, tu guía personal. 😊 ¿En qué sección de la app necesitas ayuda hoy?',
      '¡Hola! Qué bueno verte por aquí. ¿Quieres que te explique cómo usar alguna función?',
      '¡Hola! Estoy lista para ayudarte. ¿Buscas cómo comprar, vender o configurar algo?'
    ],
    'gracias': [
      '¡De nada! Es un placer ayudarte. ¿Alguna otra duda con los pasos?',
      '¡Para eso estoy! Si necesita ayuda de nuevo, aquí me tiene de nuevo.',
      '¡Excelente! Disfruta de la aplicación. 😊'
    ],
    'quien_eres': [
      'Soy Juli, tu asistente de bolsillo. Conozco cada rincón de esta app y le puedo indicar el paso a paso para llegar a donde desee.',
      'Me llamo Juli. Mi misión es que no se pierda nunca entre tantas opciones. Solo dígame qué quiere hacer y le doy la guía.'
    ],
    'ayuda_general': [
      'Puedo darle guías paso a paso para:\n- Comprar y pagar\n- Vender sus productos\n- Configurar su perfil y temas\n- Ver sus facturas y reportes\n¿Por dónde desea empezar?',
      'Si tiene dudas, solo dígame palabras clave como "comprar", "vender", "modo oscuro" o "mi perfil" y le daré las instrucciones exactas.'
    ],
    'despedida': [
      '¡Hasta pronto! Recuerda que siempre me encuentras en el menú "Más". 😊',
      '¡Nos vemos! Espero que la guía le haya servido de mucho.',
      '¡Cualquier otra duda, aquí estaré esperándole! 👋'
    ]
  }
};

// ===================== FUNCIÓN MEJORADA DE RESPUESTAS (INTELIGENTE) =====================
export const getBotResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase().trim();

  // 1. Verificar coincidencias exactas o Regex (Prioridad Alta)
  for (const [pattern, responseKey] of Object.entries(legacyKeywords)) {
    try {
      const regex = new RegExp(`(^|\\s)${pattern}(\\s|$)`, 'i');
      if (regex.test(message)) {
        return getRandomResponse(responseKey);
      }
    } catch (e) {
      console.warn('Invalid regex pattern:', pattern);
    }
  }

  // 2. Búsqueda por palabras clave ponderadas
  const intentMap: Record<string, string> = {
    'compr|pedid|orden|carro|carrito|pagar': 'compras.hacer_compra',
    'compras|historial|donde esta': 'compras.ver_pedidos',
    'vend|public|subir prod': 'ventas.publicar_producto',
    'mis prod|editar prod|mis articulos': 'ventas.gestionar_productos',
    'mis vent|pedidos de venta': 'ventas.ver_ventas',
    'report|estadistic|gananc': 'ventas.reportes_vendedor',
    'oscuro|claro|tema|apariencia': 'configuracion.modo_oscuro',
    'notific|avisos|alertas': 'configuracion.ajustes_notificaciones',
    'lenta|espacio|limpi|cache': 'configuracion.limpiar_cache',
    'direcc|entrega|donde vivo': 'perfil.gestionar_direcciones',
    'tarjet|banco|pago movil': 'perfil.metodos_pago',
    'perfil|mi nombre|mi foto': 'perfil.editar_perfil',
    'contraseña|clave|password': 'cuenta.cambiar_contraseña',
    'admin|dashboard|panel': 'admin.dashboard_admin',
    'usuarios|gente|clien': 'admin.gestionar_usuarios',
    'factura|recibo|comprobante': 'compras.ver_pedidos',
    'favorit|corazon': 'compras.favoritos',
    'hola|buenas|hi': 'naturales.saludo',
    'gracias|thx|vale': 'naturales.gracias',
    'quien|eres|nombre': 'naturales.quien_eres',
    'adios|chao|nos vemos': 'naturales.despedida'
  };

  for (const [root, responseKey] of Object.entries(intentMap)) {
    if (new RegExp(root, 'i').test(message)) {
      return getRandomResponse(responseKey);
    }
  }

  return getRandomDefaultResponse();
};

const getRandomResponse = (keyPath: string): string => {
  const [category, subcategory] = keyPath.split('.');
  const categoryData = botResponses[category];
  if (categoryData) {
    const subResponses = categoryData[subcategory];
    if (subResponses && Array.isArray(subResponses) && subResponses.length > 0) {
      return subResponses[Math.floor(Math.random() * subResponses.length)];
    }
  }
  return getRandomDefaultResponse();
}

const getRandomDefaultResponse = (): string => {
  const defaultResponses = [
    'No estoy segura de haber entendido los pasos que buscas. ¿Me podrías decir si quieres comprar, vender o configurar algo?',
    'Mmm, no reconozco esa función. Recuerda que puedo guiarte con temas de compras, ventas, tu perfil o la configuración de la app.',
    '¡Me pillaste! 😅 No sé hacer eso todavía. Pero pregúntame cómo usar las secciones de la app y te daré el paso a paso.',
    '¿Podrías decirme qué sección de la app estás buscando? Así puedo darte las instrucciones exactas.',
    'Para darte una mejor guía, por favor usa palabras como "comprar", "perfil", "ventas" o "configuración".'
  ];
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

const legacyKeywords: Record<string, string> = {
  // Pagos
  'métodos de pago|formas de pago|tarjetas|pago': 'pagos.metodos_pago',
  'problema pago|error pago|pago rechazado|no pasa pago': 'pagos.problema_pago',
  'reembolso|devolución dinero|dinero devuelto': 'pagos.reembolso',
  'cuotas|pagos divididos|meses sin interés': 'pagos.cuotas',
  'seguro|seguridad pago|pago seguro': 'pagos.seguridad_pagos',
  'promoción pago|descuento pago|oferta tarjeta': 'pagos.promociones_pago',

  // Envíos
  'tiempo entrega|cuánto tarda|llegada|entrega': 'envios.tiempo_entrega',
  'costo envío|precio envío|envío gratis|gratuito': 'envios.costo_envio',
  'seguimiento|tracking|código seguimiento|rastrear': 'envios.seguimiento',
  'cambiar dirección|modificar dirección|dirección equivocada': 'envios.cambiar_direccion',
  'entrega fallida|no recibí|no llegó|ausente': 'envios.entrega_fallida',
  'envío internacional|fuera del país|exterior': 'envios.envio_internacional',

  // Devoluciones
  'devolver|devolución|regresar producto': 'devoluciones.politica_devoluciones',
  'cómo devolver|proceso devolución|solicitar devolución': 'devoluciones.proceso_devolucion',
  'reembolso devolución|dinero devuelto|devolución dinero': 'devoluciones.reembolso_devolucion',
  'defectuoso|roto|mal estado|no funciona': 'devoluciones.producto_defectuoso',
  'cambiar|otra talla|otro color|intercambiar': 'devoluciones.cambio_producto',

  // Productos
  'buscar|encontrar producto|dónde encontrar': 'productos.buscar_producto',
  'disponible|en stock|hay existencias': 'productos.disponibilidad',
  'reservar|apartar|pre-orden': 'productos.reservar_producto',
  'comparar|diferencias|cuál mejor': 'productos.comparar_productos',
  'garantía|garantizado|reparación': 'productos.garantia',

  // Vender
  'vender|publicar|subir producto|poner a la venta': 'vender.vender_producto',
  'comisión|cuánto cobran|porcentaje venta': 'vender.comisiones',
  'enviar producto|guias envío|etiquetas': 'vender.envios_vendedor',
  'cobrar|retirar dinero|ganancias': 'vender.cobrar_ventas',
  'calificaciones|reputación|reseñas vendedor': 'vender.calificaciones_vendedor',

  // Promociones
  'cupón|código|descuento|promoción': 'promociones.cupones',
  'ofertas|rebajas|liquidación': 'promociones.ofertas',
  'puntos|fidelidad|recompensas': 'promociones.programa_fidelidad',
  'envío gratis|sin costo envío': 'promociones.envio_gratis',

  // Seguridad
  'seguridad|proteger cuenta|cuenta segura': 'seguridad.cuenta_segura',
  'transacción segura|compra segura': 'seguridad.transacciones_seguras',
  'phishing|estafa|fraude|engaño': 'seguridad.phishing',

  // Asistencia
  'contactar|soporte|hablar con alguien|agente': 'asistencia.contactar_soporte',
  'tiempo respuesta|cuándo responden|espera': 'asistencia.tiempo_respuesta',
  'reportar|problema|error|queja': 'asistencia.reportar_problema',
  'sugerencia|idea|mejora|feedback': 'asistencia.sugerencias',

  // Naturales
  'hola|buenos días|buenas tardes|buenas noches': 'naturales.saludo',
  'gracias|thank you|agradecido': 'naturales.gracias',
  'cómo estás|qué tal|todo bien': 'naturales.como_estas',
  'quién eres|qué eres|tu nombre': 'naturales.quien_eres',
  'qué puedes hacer|para qué sirves|funciones': 'naturales.que_puedes_hacer',
  'horarios|cuándo abren|atencion': 'naturales.horarios',
  'urgente|emergencia|inmediato|rápido': 'naturales.urgente',
  'recomendar|sugerir|qué comprar': 'naturales.recomendacion',
  'ayuda|no sé|no puedo|problema': 'naturales.ayuda_general',
  'adiós|chao|hasta luego|nos vemos': 'naturales.despedida',

  // Técnicos
  'no funciona|app crashea|se cierra': 'tecnicos.app_no_funciona',
  'error login|no puedo entrar|acceso denegado': 'tecnicos.error_login',
  'no carga|página blanca|error carga': 'tecnicos.pagina_no_carga',
  'notificaciones|no llegan alertas|silencioso': 'tecnicos.notificaciones_no_llegan',
  'fotos|imágenes|no sube|error subir': 'tecnicos.fotos_no_suben',

  // Productos específicos
  'electrónico|celular|laptop|tablet|tv': 'productos_especificos.electronicos',
  'ropa|camisa|pantalón|zapatos|vestido': 'productos_especificos.ropa',
  'comida|alimento|bebida|supermercado': 'productos_especificos.alimentos',
  'mueble|sofá|cama|mesa|silla': 'productos_especificos.muebles'
};