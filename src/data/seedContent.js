export const topics = [
  {
    name: 'Contraseñas y autenticación',
    slug: 'contrasenas-autenticacion',
    description:
      'Aprende a crear contraseñas fuertes y a proteger tus cuentas con la autenticación en dos pasos.',
    order: 1,
    lessons: [
      {
        title: 'Contraseñas robustas',
        content:
          'Una contraseña robusta es la primera barrera de defensa de tus cuentas. Debe ser larga (mínimo 12 caracteres) y combinar mayúsculas, minúsculas, números y símbolos.\n\nEvita usar datos personales como nombres, fechas de nacimiento o palabras comunes. Tampoco reutilices la misma contraseña en varios servicios: si una se filtra, todas tus cuentas quedan en riesgo.\n\nUna buena práctica es usar un gestor de contraseñas, que genera y recuerda contraseñas únicas y complejas por ti.',
      },
      {
        title: 'Autenticación en dos pasos (2FA)',
        content:
          'La autenticación en dos pasos añade una segunda verificación además de la contraseña, como un código temporal enviado al teléfono o generado por una aplicación.\n\nGracias al 2FA, aunque un atacante descubra tu contraseña, no podrá entrar sin el segundo factor. Actívala siempre que el servicio lo permita, especialmente en el correo y la banca.',
      },
    ],
    videos: [
      {
        title: 'Cómo crear contraseñas seguras',
        url: '',
        description: 'Video introductorio sobre contraseñas seguras y gestores de contraseñas.',
      },
    ],
    quiz: {
      title: 'Evaluación: Contraseñas y autenticación',
      passingScore: 70,
      questions: [
        {
          text: '¿Cuál es la longitud mínima recomendada para una contraseña fuerte?',
          options: ['4 caracteres', '8 caracteres', '12 caracteres', '6 caracteres'],
          correctIndex: 2,
        },
        {
          text: '¿Qué debes evitar al crear una contraseña?',
          options: [
            'Usar símbolos',
            'Usar un gestor de contraseñas',
            'Reutilizarla en varias cuentas',
            'Usar frases largas',
          ],
          correctIndex: 2,
        },
        {
          text: '¿Qué añade la autenticación en dos pasos?',
          options: [
            'Una segunda verificación además de la contraseña',
            'Un antivirus',
            'Una copia de seguridad',
            'Un nombre de usuario extra',
          ],
          correctIndex: 0,
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
        title: '¿Qué es el malware?',
        content:
          'Malware es cualquier programa diseñado para dañar, espiar o robar información de tu dispositivo. Incluye virus, gusanos, troyanos, spyware y ransomware.\n\nEl ransomware, por ejemplo, cifra tus archivos y exige un rescate para recuperarlos. El spyware espía tu actividad y puede robar contraseñas y datos personales.',
      },
      {
        title: 'Cómo protegerte del malware',
        content:
          'Mantén el sistema operativo y las aplicaciones actualizadas, ya que las actualizaciones corrigen fallos de seguridad. Usa un antivirus confiable y descarga software solo de sitios oficiales.\n\nDesconfía de los adjuntos y enlaces de remitentes desconocidos, y realiza copias de seguridad periódicas para reducir el impacto de un posible ataque.',
      },
    ],
    videos: [
      {
        title: 'Tipos de malware explicados',
        url: '',
        description: 'Video sobre virus, troyanos, spyware y ransomware.',
      },
    ],
    quiz: {
      title: 'Evaluación: Malware y antivirus',
      passingScore: 70,
      questions: [
        {
          text: 'El malware es...',
          options: [
            'Un programa diseñado para dañar o robar información',
            'Un tipo de contraseña',
            'Una red social',
            'Un navegador',
          ],
          correctIndex: 0,
        },
        {
          text: '¿Cuál es una buena práctica para evitar malware?',
          options: [
            'Descargar software de sitios no oficiales',
            'Ignorar las actualizaciones',
            'Abrir todos los adjuntos',
            'Mantener el sistema actualizado y usar antivirus',
          ],
          correctIndex: 3,
        },
        {
          text: 'El ransomware...',
          options: [
            'Mejora el rendimiento',
            'Cifra tus archivos y pide rescate',
            'Solo afecta celulares',
            'Es un tipo de contraseña',
          ],
          correctIndex: 1,
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
        title: '¿Qué es la ingeniería social?',
        content:
          'La ingeniería social es el conjunto de técnicas que usan los atacantes para manipular a las personas y conseguir información confidencial, acceso o acciones que comprometan la seguridad.\n\nA diferencia de los ataques técnicos, aquí se explota la confianza, la curiosidad y las emociones humanas.',
      },
      {
        title: 'Técnicas comunes de engaño',
        content:
          'Algunas técnicas comunes son la suplantación de identidad, las llamadas fingiendo ser soporte técnico, los premios falsos y el pretexto de una urgencia.\n\nAnte cualquier solicitud de datos o dinero, verifica la identidad del interlocutor por un canal oficial y no compartas contraseñas ni códigos de verificación.',
      },
    ],
    videos: [
      {
        title: 'Cómo funciona la ingeniería social',
        url: '',
        description: 'Video sobre manipulación, suplantación y engaños.',
      },
    ],
    quiz: {
      title: 'Evaluación: Ingeniería social',
      passingScore: 70,
      questions: [
        {
          text: 'La ingeniería social explota...',
          options: [
            'Fallos del hardware',
            'La confianza y el comportamiento humano',
            'La velocidad de internet',
            'Los cables de red',
          ],
          correctIndex: 1,
        },
        {
          text: 'Un ejemplo de ingeniería social es...',
          options: [
            'Un firewall',
            'Una llamada fingiendo ser soporte técnico',
            'Un antivirus',
            'Un gestor de contraseñas',
          ],
          correctIndex: 1,
        },
        {
          text: 'Ante una petición urgente de datos...',
          options: [
            'Proporciona todo rápido',
            'Confirma la identidad por un canal oficial',
            'Ignora la seguridad',
            'Comparte tu contraseña',
          ],
          correctIndex: 1,
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
        title: 'Configura tu privacidad',
        content:
          'Revisa periódicamente la configuración de privacidad de tus redes sociales. Limita quién puede ver tus publicaciones, tu lista de amigos y tu información de perfil.\n\nDesactiva la ubicación automática en las publicaciones y controla qué aplicaciones tienen acceso a tu cuenta.',
      },
      {
        title: 'Comparte con cuidado',
        content:
          'La información que publicas puede ser utilizada por desconocidos. Evita compartir datos como tu dirección, rutina diaria o documentos personales.\n\nAntes de aceptar solicitudes de amistad, verifica la identidad de la persona. Recuerda que lo publicado en internet puede permanecer disponible durante mucho tiempo.',
      },
    ],
    videos: [
      {
        title: 'Privacidad en redes sociales',
        url: '',
        description: 'Video sobre configuración de privacidad y datos personales.',
      },
    ],
    quiz: {
      title: 'Evaluación: Redes sociales y privacidad',
      passingScore: 70,
      questions: [
        {
          text: '¿Qué debes revisar en tus redes sociales?',
          options: [
            'La configuración de privacidad',
            'El color de fondo',
            'La marca del celular',
            'La velocidad de carga',
          ],
          correctIndex: 0,
        },
        {
          text: 'Publicar tu ubicación en tiempo real puede...',
          options: [
            'Mejorar tu seguridad',
            'Exponer tu ubicación a desconocidos',
            'Aumentar la batería',
            'Reducir el spam',
          ],
          correctIndex: 1,
        },
        {
          text: 'Antes de aceptar una solicitud de amistad debes...',
          options: [
            'Aceptar a todos',
            'Verificar quién es la persona',
            'Compartir tu contraseña',
            'Publicar tus datos',
          ],
          correctIndex: 1,
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
        title: 'Reconoce el phishing',
        content:
          'El phishing es un intento de engaño que suplanta a una persona o empresa para que entregues tus datos, contraseñas o datos bancarios.\n\nSeñales típicas: errores de escritura, urgencia, remitentes extraños, enlaces que no coinciden con el sitio oficial y solicitudes de información confidencial.',
      },
      {
        title: 'Qué hacer ante un intento de phishing',
        content:
          'No hagas clic en enlaces sospechosos ni descargues adjuntos de remitentes desconocidos. Verifica el dominio del sitio antes de ingresar datos.\n\nSi crees que ya entregaste tus credenciales, cambia la contraseña de inmediato, activa el 2FA y reporta el mensaje.',
      },
    ],
    videos: [
      {
        title: 'Cómo detectar un correo de phishing',
        url: '',
        description: 'Video con ejemplos reales de correos fraudulentos.',
      },
    ],
    quiz: {
      title: 'Evaluación: Phishing',
      passingScore: 70,
      questions: [
        {
          text: 'El phishing busca...',
          options: [
            'Mejorar tu cuenta',
            'Obtener tus datos y credenciales',
            'Actualizar tu sistema',
            'Acelerar tu conexión',
          ],
          correctIndex: 1,
        },
        {
          text: 'Una señal típica de phishing es...',
          options: [
            'Un correo con errores y urgencia',
            'Una web oficial certificada',
            'Una actualización automática',
            'Un mensaje de un amigo verificado',
          ],
          correctIndex: 0,
        },
        {
          text: 'Si recibes un enlace sospechoso debes...',
          options: [
            'Hacer clic de inmediato',
            'Reenviarlo a todos',
            'Verificar el remitente y no hacer clic',
            'Ingresar tus datos',
          ],
          correctIndex: 2,
        },
      ],
    },
  },
];
