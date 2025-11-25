"use client"

import { useRouter } from "next/navigation"

export default function ConfirmacaoPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FA] to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] text-white rounded-xl p-8 text-center mb-8 shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Tudo Pronto!</h1>
          <p className="text-xl opacity-95">Seu veículo está regularizado e protegido</p>
        </div>

        {/* Confirmation Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#071D41] mb-6 text-center">O que acontece agora?</h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="font-bold text-[#071D41] mb-1">Débitos Quitados</h3>
                <p className="text-[#555555]">Seus débitos foram pagos e serão processados em até 48 horas úteis</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="font-bold text-[#071D41] mb-1">Comprovante Enviado</h3>
                <p className="text-[#555555]">Você receberá o comprovante de pagamento via WhatsApp e SMS</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="font-bold text-[#071D41] mb-1">Monitoramento Ativo</h3>
                <p className="text-[#555555]">
                  Seu serviço de monitoramento já está ativo e você receberá alertas sobre qualquer novidade
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-[#F0F7FF] rounded-xl p-6 text-center border border-[#1351B4]/20">
          <h3 className="font-bold text-[#071D41] mb-2">Precisa de ajuda?</h3>
          <p className="text-[#555555] mb-4">Nossa equipe está disponível 24/7 para atendê-lo</p>
          <button
            onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
            className="bg-[#25D366] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#20BA5A] transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar no WhatsApp
          </button>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button onClick={() => router.push("/")} className="text-[#1351B4] hover:underline font-medium">
            Voltar para o início
          </button>
        </div>
      </div>
    </div>
  )
}
