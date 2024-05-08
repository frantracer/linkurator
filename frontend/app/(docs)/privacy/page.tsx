import type {NextPage} from "next";
import "../docs_styles.css"
import React from "react";

const PrivacyPolicy: NextPage = () => {
  return (
    <div className="flex w-full justify-center">
      <div className="max-w-screen-lg">
        <h1 className="text-5xl font-bold py-5 uppercase text-center">
          <img src="/logo_v1_medium.png" alt="Linkurator logo" className="w-20 h-20 inline-block mx-4"/>
          Linkurator
        </h1>

        <h1>Política de Privacidad</h1>
        <p>Última actualización: 06/05/2024</p>
        <p>
          En Linkurator (&quot;nosotros&quot;, &quot;nuestro/a&quot;), el respeto a su privacidad es nuestra prioridad.
          Esta Política de Privacidad explica cómo recopilamos, usamos, protegemos y, en ciertas circunstancias,
          compartimos su información personal. Esta política aplica únicamente a la información recopilada a través de
          nuestra aplicación y no a la información recopilada offline.
        </p>

        <h2>Información que Recopilamos</h2>
        <p>La información personal que recopilamos de nuestros usuarios (&quot;usted&quot;) es:
        </p>
        <ul>
          <li>Nombre</li>
          <li>Apellidos</li>
          <li>Correo electrónico</li>
          <li>Cuenta asociada de Youtube</li>
          <li>Subscripciones de su cuenta de Youtube</li>
        </ul>
        <p>
          Además de su infomación personal, recopilamos datos de uso de la aplicación
        </p>

        <h2>Uso de la Información</h2>
        <p>
          Usamos la información que recopilamos sobre usted para:
        </p>
        <ul>
          <li>Brindar, operar y mantener nuestra aplicación</li>
          <li>Mejorar, personalizar y expandir nuestra aplicación</li>
          <li>Entender y analizar cómo utiliza nuestra aplicación</li>
          <li>Desarrollar nuevos productos, servicios, características y funcionalidades</li>
          <li>Comunicarnos con usted para proporcionarle actualizaciones y otra información relacionada con la
            aplicación
          </li>
          <li>Enviarle correos electrónicos</li>
        </ul>

        <h2>Protección de su Información</h2>
        <p>
          Nos comprometemos a proteger su información personal. Implementamos una variedad de medidas de seguridad para
          mantener la seguridad de su información personal. Sin embargo, tenga en cuenta que ninguna medida de seguridad
          es infalible.
        </p>
        <p>
          No vendemos, comerciamos, o de otra manera transferimos a terceros su información personal identificable,
          excepto para cumplir con una obligación legal.
        </p>

        <h2>Cumplimiento con el GDPR</h2>
        <p>
          En Linkurator, estamos comprometidos con la protección de datos y con el cumplimiento del Reglamento General
          de Protección de Datos (GDPR) de la Unión Europea. Esta sección proporciona información adicional relevante
          para los usuarios en la Unión Europea.
        </p>
        <p>
          El procesamiento de su información personal se basa en las siguientes bases legales:
        </p>
        <ul>
          <li>
            Consentimiento: Le pedimos su consentimiento para procesar su información personal para propósitos
            específicos y tiene el derecho de retirar su consentimiento en cualquier momento.
          </li>
          <li>
            Contrato: El procesamiento es necesario para la ejecución de un contrato en el que usted es parte, o para
            tomar medidas a solicitud suya antes de celebrar un contrato.
          </li>
          <li>
            Obligaciones legales: El procesamiento es necesario para cumplir con nuestras obligaciones legales.
          </li>
          <li>
            Intereses legítimos: Procesamos su información para nuestros intereses legítimos, como mejorar nuestros
            servicios, comunicarnos con usted o garantizar la seguridad de nuestra aplicación, siempre que dichos
            intereses no sean superados por sus derechos y libertades.
          </li>
        </ul>

        <h2>Sus Derechos bajo el GDPR</h2>
        <p>
          Bajo el GDPR, usted tiene varios derechos con respecto a su información personal, incluyendo:
        </p>
        <ul>
          <li>Derecho de acceso: Puede solicitar acceso a su información personal que procesamos.</li>
          <li>Derecho de rectificación: Puede solicitar que corrijamos cualquier información incorrecta o incompleta.
          </li>
          <li>Derecho de supresión: Puede solicitar la eliminación de su información personal.</li>
          <li>Derecho a restringir el procesamiento: Puede solicitar que limitemos el procesamiento de su información
            personal.
          </li>
          <li>Derecho a la portabilidad de los datos: Puede solicitar recibir su información personal en un formato
            estructurado, de uso común y legible por máquina.
          </li>
          <li>Derecho de oposición: Puede oponerse al procesamiento de su información personal por motivos
            relacionados
            con su
            situación particular.
          </li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, puede usar la aplicación o contáctenos utilizando la información de
          contacto proporcionada en esta política. Si tiene una queja sobre cómo manejamos su información personal,
          también tiene el derecho de presentar una queja ante una autoridad de protección de datos.
        </p>

        <h2>Cambios a esta Política de Privacidad</h2>
        <p>
          Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Los cambios entrarán
          en vigor inmediatamente después de su publicación en nuestra aplicación. Le recomendamos revisar
          periódicamente esta Política de Privacidad para estar informado de cualquier cambio.
        </p>

        <h2>Contacto</h2>
        <p>
          Si tiene preguntas o comentarios sobre esta Política de Privacidad, por favor contáctenos en
          admin@linkurator.com.
        </p>

      </div>
    </div>
  );
}

export default PrivacyPolicy;
