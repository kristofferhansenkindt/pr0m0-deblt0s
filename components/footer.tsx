import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#071D41] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-bold uppercase mb-4 border-b border-gray-700 pb-2">Acesso Rápido</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Página Inicial
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Serviços
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Consultas
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase mb-4 border-b border-gray-700 pb-2">Canais de Atendimento</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Fale Conosco
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Ouvidoria
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Telefones Úteis
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase mb-4 border-b border-gray-700 pb-2">Redes Sociais</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  YouTube
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase mb-4 border-b border-gray-700 pb-2">Informações</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Acessibilidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image
                src="/images/govbr-logo.webp"
                alt="gov.br"
                width={100}
                height={30}
                className="h-8 w-auto brightness-200"
              />
            </div>
            <div className="text-xs text-gray-400">
              © {new Date().getFullYear()} - Governo Federal - Todos os direitos reservados
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
