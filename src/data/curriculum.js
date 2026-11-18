import { questionBanks } from './questionBank.js';

export const modules = [
  {
    name: 'Contraseñas y autenticación',
    slug: 'contrasenas-autenticacion',
    description:
      'Aprende a crear contraseñas robustas y a proteger tus cuentas con la autenticación multifactor.',
    order: 1,
    lessons: [
      {
        order: 1,
        title: 'Fundamentos de contraseñas y autenticación',
        introduction:
          'La seguridad de las contraseñas y los mecanismos de autenticación constituye uno de los pilares fundamentales de la protección de la información en los entornos digitales. Gran parte de las actividades personales, académicas, laborales y financieras dependen de plataformas que requieren identificación para permitir el acceso. Una contraseña funciona como primera barrera frente a accesos no autorizados. Sin embargo, las contraseñas débiles, repetidas o fáciles de adivinar representan un riesgo importante.',
        objectives: [
          'Comprender por qué las contraseñas son la primera barrera de protección de la información.',
          'Diferenciar autenticación, autenticación multifactor, verificación en dos pasos y gestor de contraseñas.',
          'Reconocer las características de una contraseña segura.',
        ],
        content:
          'Conceptos fundamentales\n\n• Contraseña segura: clave suficientemente larga, difícil de adivinar y diferente para cada servicio.\n• Autenticación: proceso mediante el cual un sistema comprueba que una persona es quien afirma ser.\n• Autenticación multifactor (MFA): utiliza dos o más factores diferentes para verificar la identidad.\n• Verificación en dos pasos (2FA): añade una segunda comprobación al inicio de sesión.\n• Gestor de contraseñas: herramienta para almacenar y administrar credenciales de forma protegida.',
        example: '',
        recommendations: [],
      },
      {
        order: 2,
        title: 'Amenazas y riesgos de las credenciales',
        introduction:
          'Las contraseñas débiles, repetidas o fáciles de adivinar representan un riesgo importante. Los ciberdelincuentes pueden utilizar ataques de fuerza bruta, diccionarios, filtraciones de bases de datos y técnicas de ingeniería social para obtener credenciales.',
        objectives: [
          'Identificar los ataques de fuerza bruta y de diccionario.',
          'Explicar el relleno de credenciales y el robo de credenciales.',
          'Analizar un caso práctico de reutilización de contraseñas.',
        ],
        content:
          'Amenazas y riesgos principales\n\n• Fuerza bruta: intentos automatizados de descubrir una contraseña probando múltiples combinaciones.\n• Ataque de diccionario: prueba de contraseñas frecuentes y palabras incluidas en listas.\n• Relleno de credenciales: uso de contraseñas filtradas en un servicio para intentar acceder a otras cuentas.\n• Robo de credenciales: obtención de datos de acceso mediante engaños o páginas falsas.',
        example:
          'Una persona utiliza la misma contraseña para su correo y una red social. Si la contraseña de la red social queda expuesta en una filtración, un atacante podría probarla también en el correo. Esto muestra por qué es importante utilizar claves diferentes y activar un segundo factor.',
        recommendations: [],
      },
      {
        order: 3,
        title: 'Buenas prácticas y autenticación multifactor',
        introduction:
          'Además de crear contraseñas robustas, conviene utilizar mecanismos adicionales de autenticación y aplicar hábitos seguros en la gestión de credenciales.',
        objectives: [
          'Aplicar recomendaciones para crear y gestionar contraseñas seguras.',
          'Valorar el uso de la autenticación multifactor y de los gestores de contraseñas.',
          'Identificar cuándo es necesario cambiar credenciales comprometidas.',
        ],
        content:
          'Recomendaciones de seguridad\n\nLas siguientes prácticas reducen el riesgo de acceso no autorizado a tus cuentas y servicios.',
        example: '',
        recommendations: [
          'Utilizar contraseñas largas y únicas para cada cuenta.',
          'Activar la autenticación multifactor siempre que esté disponible.',
          'No compartir contraseñas ni códigos de verificación.',
          'Evitar datos personales evidentes, como fechas de nacimiento o nombres.',
          'Utilizar un gestor de contraseñas confiable.',
          'Cambiar las credenciales cuando exista evidencia de que fueron comprometidas.',
        ],
      },
    ],
    video: {
      title: 'Campaña de ciberseguridad: Contraseñas seguras',
      url: 'https://www.youtube.com/watch?v=vQiXPOASpZs',
      description:
        'Consejos de la Guardia Civil para crear contraseñas seguras y robustas.',
    },
    quiz: {
      title: 'Evaluación: Contraseñas y autenticación',
      passingScore: 70,
      questions: [
        {
          text: '¿Qué utiliza la autenticación multifactor (MFA)?',
          options: [
            'Una sola contraseña muy larga',
            'Dos o más factores diferentes para verificar la identidad',
            'Un antivirus actualizado',
            'Una copia de seguridad',
          ],
          correctIndex: 1,
        },
        {
          text: '¿Qué ataque reutiliza contraseñas filtradas de un servicio para intentar acceder a otras cuentas?',
          options: [
            'Fuerza bruta',
            'Ataque de diccionario',
            'Relleno de credenciales',
            'Phishing',
          ],
          correctIndex: 2,
        },
        {
          text: '¿Cuál es una recomendación de seguridad para las contraseñas?',
          options: [
            'Usar la misma clave en todos los servicios',
            'Compartirla solo con personas de confianza',
            'Utilizar contraseñas largas y únicas para cada cuenta',
            'Usar fechas de nacimiento',
          ],
          correctIndex: 2,
        },
      ],
    },
  },
  {
    name: 'Malware y antivirus',
    slug: 'malware-antivirus',
    description:
      'Conoce los tipos de software malicioso y cómo proteger tus dispositivos con buenas prácticas y antivirus.',
    order: 2,
    lessons: [
      {
        order: 1,
        title: 'Qué es el malware y sus tipos',
        introduction:
          'El malware, también conocido como software malicioso, comprende programas diseñados para infiltrarse, alterar, dañar o acceder sin autorización a dispositivos y sistemas informáticos. Sus objetivos pueden incluir robar información personal, controlar equipos, espiar actividades, cifrar archivos o interrumpir servicios.',
        objectives: [
          'Definir qué es el malware y cuáles son sus objetivos.',
          'Identificar virus, gusanos, troyanos, ransomware, spyware y keyloggers.',
          'Comprender cómo se propaga el software malicioso.',
        ],
        content:
          'Conceptos fundamentales\n\n• Virus informático: programa que se incorpora a otros archivos y puede propagarse cuando estos se ejecutan.\n• Gusano (worm): malware capaz de propagarse automáticamente entre equipos o redes.\n• Troyano: programa que aparenta ser legítimo, pero oculta funciones maliciosas.\n• Ransomware: amenaza que cifra archivos o bloquea sistemas y exige un pago para intentar recuperar el acceso.\n• Spyware: software que recopila información sin conocimiento o autorización del usuario.\n• Keylogger: herramienta que registra las pulsaciones del teclado y puede capturar información confidencial.',
        example: '',
        recommendations: [],
      },
      {
        order: 2,
        title: 'Vías de propagación y riesgos',
        introduction:
          'El malware puede llegar a nuestros dispositivos por distintas vías. Reconocer estas amenazas ayuda a evitar la infección y a actuar a tiempo.',
        objectives: [
          'Identificar las principales vías de propagación del malware.',
          'Reconocer los riesgos de los archivos adjuntos y las descargas no confiables.',
          'Analizar un caso práctico de ransomware.',
        ],
        content:
          'Amenazas y riesgos principales\n\n• Archivos adjuntos inesperados o descargas de sitios no confiables.\n• Aplicaciones fraudulentas que solicitan permisos innecesarios.\n• Dispositivos USB de procedencia desconocida.\n• Vulnerabilidades de programas o sistemas que no han sido actualizados.',
        example:
          'Un equipo comienza a mostrar archivos con nombres extraños y el usuario ya no puede abrir sus documentos. Podría tratarse de ransomware. La persona debe desconectar el equipo de la red, evitar seguir instrucciones del atacante sin asesoría y contactar al soporte técnico o personal especializado.',
        recommendations: [],
      },
      {
        order: 3,
        title: 'Protección y respuesta ante malware',
        introduction:
          'Ningún antivirus garantiza protección absoluta: debe complementarse con actualizaciones, copias de seguridad y hábitos seguros.',
        objectives: [
          'Aplicar medidas de prevención frente al malware.',
          'Planificar copias de seguridad y mantener una copia desconectada.',
          'Saber cómo actuar ante una posible infección.',
        ],
        content:
          'Recomendaciones de seguridad\n\nLa prevención combina herramientas actualizadas y hábitos responsables.',
        example: '',
        recommendations: [
          'Mantener actualizado el sistema operativo y las aplicaciones.',
          'Instalar programas únicamente desde fuentes confiables.',
          'Evitar abrir archivos inesperados o de remitentes desconocidos.',
          'Utilizar una solución de seguridad reconocida y mantenerla actualizada.',
          'Realizar copias de seguridad periódicas y conservar una copia desconectada.',
          'No conectar dispositivos USB de procedencia desconocida.',
        ],
      },
    ],
    video: {
      title: 'Tipos de malware: virus, troyanos y gusanos',
      url: 'https://www.youtube.com/watch?v=QOP9pQCIBqc',
      description:
        'Explicación sencilla de los tipos de malware más comunes y cómo afectan a los dispositivos.',
    },
    quiz: {
      title: 'Evaluación: Malware y antivirus',
      passingScore: 70,
      questions: [
        {
          text: '¿Qué tipo de malware cifra archivos y exige un pago para recuperar el acceso?',
          options: ['Gusano', 'Ransomware', 'Keylogger', 'Spyware'],
          correctIndex: 1,
        },
        {
          text: '¿Qué malware puede propagarse automáticamente entre equipos o redes?',
          options: ['Gusano (worm)', 'Troyano', 'Keylogger', 'Adware'],
          correctIndex: 0,
        },
        {
          text: 'Ante un posible caso de ransomware, ¿qué se recomienda hacer primero?',
          options: [
            'Pagar el rescate de inmediato',
            'Seguir las instrucciones del atacante',
            'Desconectar el equipo de la red y contactar a soporte especializado',
            'Compartir el archivo con más personas',
          ],
          correctIndex: 2,
        },
      ],
    },
  },
  {
    name: 'Ingeniería social',
    slug: 'ingenieria-social',
    description:
      'Descubre cómo los atacantes manipulan a las personas para obtener información y cómo reconocerlo.',
    order: 3,
    lessons: [
      {
        order: 1,
        title: 'Qué es la ingeniería social',
        introduction:
          'La ingeniería social es un conjunto de técnicas de manipulación que busca influir en el comportamiento de las personas para conseguir información confidencial, acceso a sistemas o acciones que comprometan la seguridad. En lugar de depender únicamente de vulnerabilidades tecnológicas, estos ataques aprovechan factores humanos como la confianza, el miedo, la curiosidad, la urgencia y la falta de conocimiento.',
        objectives: [
          'Definir la ingeniería social y su objetivo.',
          'Identificar los factores humanos que aprovechan los atacantes.',
          'Diferenciar pretexting, baiting, phishing, vishing y smishing.',
        ],
        content:
          'Conceptos fundamentales\n\n• Pretexting: el atacante inventa una situación o identidad para conseguir información.\n• Baiting (cebo): ofrece algo atractivo para inducir una acción peligrosa, como abrir un archivo o conectar un dispositivo.\n• Phishing: utiliza comunicaciones fraudulentas para engañar y obtener información.\n• Vishing: engaño mediante llamadas telefónicas.\n• Smishing: mensajes de texto fraudulentos con enlaces o solicitudes engañosas.\n• Suplantación de identidad: el atacante se hace pasar por una persona u organización legítima.',
        example: '',
        recommendations: [],
      },
      {
        order: 2,
        title: 'Tácticas de manipulación y riesgos',
        introduction:
          'Los atacantes aprovechan la urgencia, el miedo, la autoridad, la confianza y la curiosidad para manipular a sus víctimas. Los atacantes pueden hacerse pasar por empleados de bancos, técnicos de soporte, compañeros, familiares o representantes de empresas.',
        objectives: [
          'Reconocer las principales tácticas de manipulación.',
          'Analizar un caso de suplantación telefónica.',
          'Comprender por qué no se deben compartir códigos de verificación.',
        ],
        content:
          'Amenazas y riesgos principales\n\n• Urgencia: mensajes que exigen actuar inmediatamente.\n• Miedo: amenazas de bloqueo de cuentas o pérdida de dinero.\n• Autoridad: suplantación de instituciones o personas con cargos importantes.\n• Confianza: uso de identidades conocidas para reducir las sospechas.\n• Curiosidad: envío de mensajes o archivos que despiertan interés.',
        example:
          'Una persona recibe una llamada de alguien que afirma trabajar para su banco. El supuesto empleado dice que detectó movimientos sospechosos y solicita el código de verificación que acaba de llegar al teléfono. La víctima entrega el código y el atacante consigue avanzar en el acceso a su cuenta. Los códigos de verificación nunca deben compartirse con quien llama o escribe.',
        recommendations: [],
      },
      {
        order: 3,
        title: 'Prevención y verificación',
        introduction:
          'La prevención exige verificar identidades, desconfiar de solicitudes inesperadas y evitar decisiones apresuradas.',
        objectives: [
          'Verificar la identidad de quien solicita información mediante canales oficiales.',
          'Proteger contraseñas y códigos de verificación.',
          'Detener conversaciones con señales de manipulación.',
        ],
        content:
          'Recomendaciones de seguridad\n\nAnte cualquier solicitud de datos, dinero o acceso, aplica estas medidas.',
        example: '',
        recommendations: [
          'Verificar la identidad de quien solicita información mediante canales oficiales.',
          'No compartir contraseñas ni códigos de verificación.',
          'Desconfiar de solicitudes inesperadas y mensajes que presionan para actuar.',
          'Evitar descargar archivos de remitentes desconocidos.',
          'Confirmar directamente con la entidad cualquier alerta recibida.',
          'Detener la conversación si existen señales de manipulación.',
        ],
      },
    ],
    video: {
      title: '¿Qué es la ingeniería social?',
      url: 'https://www.youtube.com/watch?v=TentnM1-lg0',
      description:
        'Video de INCIBE que explica qué es la ingeniería social y cómo identificarla.',
    },
    quiz: {
      title: 'Evaluación: Ingeniería social',
      passingScore: 70,
      questions: [
        {
          text: '¿Qué técnica inventa una situación o identidad para conseguir información?',
          options: ['Pretexting', 'Ransomware', 'Keylogger', 'Firewall'],
          correctIndex: 0,
        },
        {
          text: '¿Qué factores aprovechan principalmente los ataques de ingeniería social?',
          options: [
            'Fallos del hardware',
            'La confianza, el miedo, la urgencia y la curiosidad',
            'La velocidad de la red',
            'Los cables de conexión',
          ],
          correctIndex: 1,
        },
        {
          text: 'Si alguien solicita un código de verificación, ¿qué debes hacer?',
          options: [
            'Compartirlo si dice ser del banco',
            'Enviarlo por mensaje de texto',
            'No compartirlo y verificar por un canal oficial',
            'Publicarlo en redes sociales',
          ],
          correctIndex: 2,
        },
      ],
    },
  },
  {
    name: 'Redes sociales y privacidad',
    slug: 'redes-sociales-privacidad',
    description:
      'Aprende a configurar la privacidad de tus redes sociales y a compartir información de forma segura.',
    order: 4,
    lessons: [
      {
        order: 1,
        title: 'Identidad digital y privacidad',
        introduction:
          'Las redes sociales son herramientas importantes para la comunicación, el entretenimiento, el aprendizaje y el intercambio de información. Sin embargo, su uso implica compartir datos personales que pueden quedar expuestos si no se administran correctamente las opciones de privacidad y seguridad.',
        objectives: [
          'Comprender qué son la privacidad digital y la identidad digital.',
          'Identificar qué es la huella digital y los datos personales.',
          'Reconocer la importancia de la geolocalización y la configuración de privacidad.',
        ],
        content:
          'Conceptos fundamentales\n\n• Privacidad digital: capacidad de controlar qué información personal se comparte y quién puede acceder a ella.\n• Identidad digital: conjunto de datos, publicaciones, interacciones y actividades que representan a una persona en Internet.\n• Huella digital: rastro de información que dejamos al utilizar servicios y plataformas digitales.\n• Datos personales: información que permite identificar directa o indirectamente a una persona.\n• Geolocalización: información que permite determinar la ubicación geográfica de un dispositivo o usuario.\n• Configuración de privacidad: herramientas para controlar la visibilidad de la información y las interacciones.',
        example: '',
        recommendations: [],
      },
      {
        order: 2,
        title: 'Riesgos de compartir en redes',
        introduction:
          'Cada publicación, fotografía, comentario, ubicación o dato personal contribuye a construir una identidad digital. Esta información puede ser utilizada por terceros para conocer hábitos, intereses, relaciones y actividades cotidianas.',
        objectives: [
          'Identificar los riesgos de publicar información personal.',
          'Analizar un caso práctico de exposición de rutinas y ubicación.',
          'Comprender las consecuencias de compartir demasiados detalles.',
        ],
        content:
          'Amenazas y riesgos principales\n\n• Robo de identidad mediante información publicada.\n• Suplantación de perfiles y cuentas.\n• Ciberacoso y hostigamiento digital.\n• Exposición de fotografías y datos privados.\n• Fraudes mediante perfiles falsos.\n• Seguimiento de actividades mediante información de ubicación.',
        example:
          'Un estudiante publica fotografías que muestran su vivienda, universidad, horarios y lugares frecuentes. Una persona desconocida podría analizar esas publicaciones para inferir sus rutinas y ubicación. Compartir demasiados detalles puede facilitar el seguimiento, la suplantación de identidad o diferentes formas de engaño.',
        recommendations: [],
      },
      {
        order: 3,
        title: 'Configuración y hábitos seguros',
        introduction:
          'Proteger la privacidad requiere controlar quién puede ver las publicaciones, revisar los permisos de las aplicaciones y limitar los datos compartidos públicamente. Incluso cuando una publicación se elimina, pueden existir capturas de pantalla o copias.',
        objectives: [
          'Configurar la visibilidad de las publicaciones y revisar permisos.',
          'Gestionar la geolocalización y los datos sensibles.',
          'Aplicar hábitos seguros antes de publicar información personal.',
        ],
        content:
          'Recomendaciones de seguridad\n\nAplica estas medidas para proteger tu privacidad en redes sociales.',
        example: '',
        recommendations: [
          'Configurar las cuentas para que solo las personas adecuadas puedan ver las publicaciones.',
          'Evitar publicar direcciones, teléfonos, documentos y otros datos sensibles.',
          'Revisar la geolocalización y desactivarla cuando no sea necesaria.',
          'Revisar los permisos concedidos a las aplicaciones.',
          'Utilizar contraseñas seguras y autenticación multifactor.',
          'Verificar solicitudes de contacto de personas desconocidas.',
          'Pensar en las consecuencias antes de publicar fotografías o información personal.',
        ],
      },
    ],
    video: {
      title: '¿Tienes privacidad de verdad en las redes sociales?',
      url: 'https://www.youtube.com/watch?v=MXf-YGQr6jI',
      description:
        'Video de PantallasAmigas sobre privacidad y datos personales en redes sociales.',
    },
    quiz: {
      title: 'Evaluación: Redes sociales y privacidad',
      passingScore: 70,
      questions: [
        {
          text: '¿Qué es la huella digital?',
          options: [
            'El rastro de información que dejamos al usar servicios y plataformas digitales',
            'La marca del dispositivo móvil',
            'Un tipo de contraseña',
            'Un antivirus',
          ],
          correctIndex: 0,
        },
        {
          text: 'Publicar ubicación, horarios y rutinas puede facilitar...',
          options: [
            'Mejorar la batería',
            'El seguimiento y la suplantación de identidad',
            'Aumentar la velocidad de internet',
            'Reducir el spam',
          ],
          correctIndex: 1,
        },
        {
          text: '¿Qué medida ayuda a proteger tu privacidad en redes sociales?',
          options: [
            'Aceptar todas las solicitudes de amistad',
            'Publicar documentos personales',
            'Limitar quién puede ver las publicaciones y revisar permisos',
            'Compartir tu ubicación en tiempo real',
          ],
          correctIndex: 2,
        },
      ],
    },
  },
  {
    name: 'Phishing',
    slug: 'phishing',
    description:
      'Identifica correos, mensajes y enlaces fraudulentos que intentan robar tus credenciales.',
    order: 5,
    lessons: [
      {
        order: 1,
        title: 'Qué es el phishing y sus tipos',
        introduction:
          'El phishing es una modalidad de ciberdelincuencia basada en la suplantación de identidad. Los atacantes intentan engañar a los usuarios para obtener información confidencial, como nombres de usuario, contraseñas, datos bancarios y códigos de verificación. Generalmente utilizan correos electrónicos, mensajes de texto, redes sociales o páginas web fraudulentas que imitan la apariencia de organizaciones legítimas.',
        objectives: [
          'Definir el phishing y su objetivo.',
          'Identificar phishing por correo, smishing, vishing, spear phishing y clone phishing.',
          'Comprender cómo los atacantes generan confianza para obtener información.',
        ],
        content:
          'Conceptos fundamentales\n\n• Phishing por correo electrónico: mensajes que aparentan proceder de entidades legítimas para robar información.\n• Smishing: ataques realizados mediante mensajes SMS.\n• Vishing: engaños realizados a través de llamadas telefónicas.\n• Spear phishing: ataques dirigidos a personas u organizaciones específicas mediante información personalizada.\n• Clone phishing: copia de un mensaje legítimo en la que se sustituyen enlaces o archivos adjuntos por elementos maliciosos.',
        example: '',
        recommendations: [],
      },
      {
        order: 2,
        title: 'Señales de alerta y riesgos',
        introduction:
          'Los mensajes de phishing suelen transmitir urgencia o preocupación y buscan que la víctima haga clic en enlaces, descargue archivos o introduzca información personal en sitios controlados por los atacantes.',
        objectives: [
          'Reconocer las señales típicas de un mensaje de phishing.',
          'Analizar un caso práctico de suplantación bancaria.',
          'Comprobar el remitente y el dominio antes de actuar.',
        ],
        content:
          'Amenazas y riesgos principales\n\n• Remitentes con direcciones extrañas o que imitan nombres oficiales.\n• Mensajes que solicitan contraseñas o códigos de seguridad.\n• Enlaces que conducen a páginas distintas de las oficiales.\n• Archivos adjuntos inesperados.\n• Errores ortográficos o redacción poco habitual.\n• Advertencias de bloqueo o suspensión inmediata.\n• Promociones o premios demasiado atractivos.',
        example:
          'Una persona recibe un correo que parece proceder de su banco. El mensaje informa de un acceso sospechoso y solicita ingresar a un enlace para verificar la cuenta. El enlace abre una página similar a la del banco. La víctima introduce su usuario y contraseña, pero en realidad entrega sus credenciales a un ciberdelincuente. La apariencia de una página no demuestra que sea legítima: se debe comprobar cuidadosamente el dominio y acceder a la entidad por sus canales oficiales.',
        recommendations: [],
      },
      {
        order: 3,
        title: 'Prevención y respuesta',
        introduction:
          'La apariencia de una página no demuestra que sea legítima: hay que comprobar cuidadosamente el dominio y acceder a la entidad por sus canales oficiales.',
        objectives: [
          'Aplicar medidas de prevención frente al phishing.',
          'Verificar remitentes y dominios antes de hacer clic.',
          'Saber cómo actuar si se entregaron credenciales.',
        ],
        content:
          'Recomendaciones de seguridad\n\nAplica estas medidas ante correos, mensajes o llamadas sospechosas.',
        example: '',
        recommendations: [
          'No abrir enlaces sospechosos ni descargar archivos inesperados.',
          'No proporcionar contraseñas ni códigos de autenticación por enlaces recibidos.',
          'Comprobar cuidadosamente el remitente y el dominio del sitio web.',
          'Contactar a la entidad mediante sus canales oficiales.',
          'Reportar el mensaje como sospechoso.',
          'Si se entregaron credenciales, cambiarlas desde un dispositivo confiable y contactar a la entidad afectada.',
        ],
      },
    ],
    video: {
      title: '¿Qué es el phishing?',
      url: 'https://www.youtube.com/watch?v=uhzV5-iFb5E',
      description:
        'Video de INCIBE que explica qué es el phishing y cómo prevenirlo.',
    },
    quiz: {
      title: 'Evaluación: Phishing',
      passingScore: 70,
      questions: [
        {
          text: '¿Qué es el spear phishing?',
          options: [
            'Un ataque dirigido a personas u organizaciones específicas con información personalizada',
            'Un tipo de antivirus',
            'Una copia de seguridad',
            'Un gestor de contraseñas',
          ],
          correctIndex: 0,
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
        },
      ],
    },
  },
];

for (const module of modules) {
  const bank = questionBanks[module.slug];

  if (bank) {
    module.quiz.questions = bank;
  }
}
