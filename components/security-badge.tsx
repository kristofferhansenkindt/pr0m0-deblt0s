export function SecurityBadge() {
  return (
    <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm">
      <div className="flex items-start">
        <div className="mr-3 text-[#1351B4]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#071D41] mb-1">Segurança e Privacidade</h3>
          <p className="text-xs text-[#555555]">
            Esta é uma conexão segura. Seus dados estão protegidos conforme a Lei Geral de Proteção de Dados (LGPD) -
            Lei nº 13.709/2018. Todas as informações são criptografadas e utilizadas exclusivamente para a finalidade
            desta consulta.
          </p>
          <div className="mt-2 flex items-center">
            <div className="flex items-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-[#06A73C] mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-[#333333]">Certificado SSL</span>
            </div>
            <div className="flex items-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-[#06A73C] mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-[#333333]">Dados Criptografados</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-[#06A73C] mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-[#333333]">Validado pelo ITI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
