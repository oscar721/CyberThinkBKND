export const phishingQuestions = [
  {
    text: '¿Qué es el spear phishing?',
    options: [
      'Un ataque dirigido a personas u organizaciones específicas con información personalizada',
      'Un tipo de antivirus',
      'Una copia de seguridad',
      'Un gestor de contraseñas',
    ],
    correctIndex: 0,
    explanation:
      'El spear phishing personaliza el mensaje para una víctima u organización concreta, lo que lo hace más creíble.',
  },
  {
    text: '¿Cuál es una señal típica de phishing?',
    options: [
      'Un mensaje con urgencia, errores y remitente extraño',
      'Una web oficial verificada',
      'Una actualización automática',
      'Un mensaje de un contacto verificado',
    ],
    correctIndex: 0,
    explanation:
      'La urgencia, los errores y los remitentes extraños son señales frecuentes. Verifica antes de hacer clic.',
  },
  {
    text: 'Si entregaste tus credenciales en un sitio de phishing, ¿qué debes hacer?',
    options: [
      'No hacer nada',
      'Cambiar las credenciales desde un dispositivo confiable y contactar a la entidad',
      'Compartir la contraseña con más personas',
      'Publicar el enlace en redes sociales',
    ],
    correctIndex: 1,
    explanation:
      'Cambia la contraseña desde un dispositivo confiable, activa MFA y avisa a la entidad afectada.',
  },
  {
    text: '¿Qué es el phishing?',
    options: [
      'Suplantar a una entidad para robar información o acceso',
      'Un ataque de fuerza bruta',
      'Un tipo de copia de seguridad',
      'Una actualización',
    ],
    correctIndex: 0,
    explanation:
      'El phishing engaña mediante mensajes o páginas falsas que imitan a organizaciones legítimas.',
  },
  {
    text: '¿Qué es el smishing?',
    options: [
      'Phishing mediante mensajes de texto',
      'Phishing por llamada',
      'Phishing por USB',
      'Phishing por fuerza bruta',
    ],
    correctIndex: 0,
    explanation:
      'Smishing usa SMS con enlaces o solicitudes fraudulentas para obtener datos.',
  },
  {
    text: '¿Qué es el vishing?',
    options: [
      'Phishing mediante llamadas telefónicas',
      'Phishing por correo',
      'Phishing por redes sociales',
      'Phishing por USB',
    ],
    correctIndex: 0,
    explanation:
      'Vishing usa llamadas para suplantar a una entidad y obtener información o acceso.',
  },
  {
    text: '¿Qué es el clone phishing?',
    options: [
      'Copiar un mensaje legítimo y sustituir enlaces o adjuntos por maliciosos',
      'Crear una cuenta nueva',
      'Usar una contraseña larga',
      'Hacer una copia de seguridad',
    ],
    correctIndex: 0,
    explanation:
      'El clone phishing imita un mensaje real para que la víctima confíe y haga clic o descargue el contenido alterado.',
  },
  {
    text: '¿Qué es el phishing por correo electrónico?',
    options: [
      'Mensajes que aparentan ser de una entidad legítima para robar información',
      'Un correo de un contacto verificado',
      'Una actualización del sistema',
      'Una copia de seguridad',
    ],
    correctIndex: 0,
    explanation:
      'Los correos de phishing imitan a bancos, empresas o servicios para que la víctima entregue datos o haga clic.',
  },
  {
    text: '¿Qué debes comprobar antes de hacer clic en un enlace?',
    options: [
      'Que el dominio corresponda al sitio oficial',
      'Que el mensaje tenga muchos colores',
      'Que llegue con urgencia',
      'Que pida tus datos personales',
    ],
    correctIndex: 0,
    explanation:
      'Comprobar el dominio ayuda a detectar enlaces que imitan a sitios legítimos pero llevan a otro destino.',
  },
  {
    text: '¿Qué debes hacer si recibes un enlace sospechoso?',
    options: [
      'No abrirlo y verificar por un canal oficial',
      'Abrirlo para comprobar',
      'Reenviarlo a todos',
      'Introducir tus datos',
    ],
    correctIndex: 0,
    explanation:
      'No interactúes con enlaces no verificados. Accede a la entidad desde su web o app oficial.',
  },
  {
    text: '¿Qué hacer si un mensaje pide tu contraseña o un código?',
    options: [
      'No proporcionarlos y reportar el mensaje',
      'Enviarlos si parece oficial',
      'Publicarlos',
      'Compartirlos por SMS',
    ],
    correctIndex: 0,
    explanation:
      'Las entidades legítimas no piden contraseñas ni códigos por mensajes inesperados. Repórtalo.',
  },
  {
    text: '¿Cómo contactar a una entidad tras una alerta sospechosa?',
    options: [
      'Mediante sus canales oficiales',
      'Respondiendo al mismo correo',
      'Usando el enlace recibido',
      'Llamando al número del mensaje',
    ],
    correctIndex: 0,
    explanation:
      'El enlace o número del mensaje puede ser falso. Usa la web, app o teléfono oficial que conozcas.',
  },
  {
    text: '¿Qué hacer con un archivo adjunto inesperado?',
    options: [
      'No abrirlo y verificar al remitente',
      'Abrirlo de inmediato',
      'Desactivar el antivirus',
      'Reenviarlo',
    ],
    correctIndex: 0,
    explanation:
      'Los adjuntos pueden contener malware. Confirma la procedencia por otro canal.',
  },
  {
    text: '¿Qué hacer si detectas un mensaje de phishing?',
    options: [
      'Reportarlo como sospechoso',
      'Reenviarlo',
      'Hacer clic',
      'Compartir tus datos',
    ],
    correctIndex: 0,
    explanation:
      'Reportar ayuda a bloquear la campaña. No interactúes con el mensaje.',
  },
  {
    text: '¿El candado HTTPS garantiza que una web es legítima?',
    options: [
      'No, también puede usarse en sitios fraudulentos',
      'Sí, siempre',
      'Sí, si es verde',
      'Sí, si tiene logo',
    ],
    correctIndex: 0,
    explanation:
      'HTTPS cifra la conexión, pero no prueba que el sitio sea confiable. Comprueba el dominio y el canal oficial.',
  },
  {
    text: '¿Qué busca un atacante con el phishing?',
    options: [
      'Obtener credenciales, datos o acceso',
      'Mejorar tu conexión',
      'Actualizar tu equipo',
      'Hacer una copia',
    ],
    correctIndex: 0,
    explanation:
      'El objetivo es robar información o conseguir que la víctima realice una acción que comprometa la seguridad.',
  },
  {
    text: '¿Qué hacer ante un premio o promoción demasiado atractiva?',
    options: [
      'Desconfiar y verificar antes de hacer clic',
      'Dar tus datos de inmediato',
      'Pagar para recibirlo',
      'Reenviarlo a todos',
    ],
    correctIndex: 0,
    explanation:
      'Las ofertas exageradas buscan que actúes sin pensar. Verifica la fuente y evita enlaces.',
  },
  {
    text: '¿Qué hacer si un mensaje amenaza con bloquear tu cuenta?',
    options: [
      'Verificar por un canal oficial y no usar el enlace',
      'Pagar de inmediato',
      'Compartir tu contraseña',
      'Hacer clic en el enlace',
    ],
    correctIndex: 0,
    explanation:
      'La amenaza crea urgencia. Comprueba directamente con la entidad y no uses el enlace del mensaje.',
  },
  {
    text: '¿Qué información puede usar un atacante para personalizar un spear phishing?',
    options: [
      'Nombre, cargo, relaciones o datos del contexto de la víctima',
      'Solo la marca del monitor',
      'El color del escritorio',
      'La velocidad de la red',
    ],
    correctIndex: 0,
    explanation:
      'El spear phishing usa datos personales o profesionales para que el mensaje parezca dirigido y creíble.',
  },
  {
    text: '¿Qué hacer si hiciste clic en un enlace de phishing pero no introdujiste datos?',
    options: [
      'Cerrar la página, no descargar nada, reportar y revisar el equipo',
      'Ignorarlo y seguir navegando',
      'Compartir el enlace',
      'Introducir tus datos para comprobar',
    ],
    correctIndex: 0,
    explanation:
      'Aunque no hayas introducido datos, el enlace pudo intentar descargar contenido. Cierra, reporta y revisa el equipo.',
  },
];
