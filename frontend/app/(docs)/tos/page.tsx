import type {NextPage} from "next";
import "../docs_styles.css"
import React from "react";

const TermsOfService: NextPage = () => {
  return (
    <div className="flex w-full justify-center">
      <div className="max-w-screen-lg">
        <h1 className="text-5xl font-bold py-5 uppercase text-center">
          <img src="/logo_v1_medium.png" alt="Linkurator logo" className="w-20 h-20 inline-block mx-4"/>
          Linkurator
        </h1>

        <h1>Términos y condiciones de uso</h1>
        <p>Última actualización: 06/05/2024</p>
        <p>
          Bienvenidos a Linkurator, una plataforma digital dedicada a recopilar y presentar contenidos de diversas
          fuentes en un solo lugar para su fácil acceso y consumo. Estos términos y condiciones rigen el uso de nuestro
          sitio web y servicios asociados.
        </p>

        <h2>Aceptación de los Términos</h2>
        <p>
          Al utilizar nuestro servicio, usted acepta estar legalmente obligado por estos términos y condiciones. Si no
          está de acuerdo con alguno de estos términos, por favor no utilice nuestro servicio.
        </p>

        <p>
          Estas condiciones están sujetas a cambios, por lo que el usuario está obligado a revisar las condiciones de
          uso periódicamente.
        </p>

        <h2>Descripción del servicio</h2>
        <p>
          Linkurator ofrece un servicio de agregación que recopila contenidos de diversas fuentes públicas
          proporcionando enlaces. No somos responsables del contenido original ni controlamos las fuentes externas.
        </p>

        <h2>Uso Aceptable</h2>
        <p>
          Se espera que los usuarios utilicen Linkurator de manera responsable y legal. Queda estrictamente prohibido
          utilizar el servicio para cualquier propósito ilegal, engañoso, malintencionado o discriminatorio.
        </p>
        <p>
          El acceso y uso de Linkurator está destinado únicamente para personas físicas. Se prohíbe estrictamente el
          acceso y uso del servicio a través de cualquier tipo de automatización, incluyendo, pero no limitado a, el uso
          de bots, arañas, o scrapers. Cualquier intento de acceder o recolectar información de Linkurator
          mediante el uso de tales medios automáticos resultará en la prohibición inmediata y permanente del acceso al
          servicio, pudiendo incluir el baneo de la dirección IP o la cuenta asociada sin previo aviso.
        </p>
        <p>
          Nos reservamos el derecho de tomar acciones legales adicionales si se considera necesario para prevenir o
          compensar cualquier violación.
        </p>

        <h2>Propiedad Intelectual</h2>
        <p>
          El contenido original pertenece a sus respectivos propietarios y está protegido por leyes de derechos de autor
          y tratados internacionales. El uso de nuestro servicio no le otorga propiedad sobre ningún contenido que
          acceda.
        </p>
      </div>
    </div>
  );
}

export default TermsOfService;
