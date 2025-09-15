
import { useRef } from 'react';

const sections = [
  { id: 'definitions', title: '1. Definições' },
  { id: 'subscriptions', title: '2. Assinaturas' },
  { id: 'services', title: '3. Serviços TouchKanban',
    children: [
      { id: 'use', title: '3.1 Uso dos Serviços' },
      { id: 'modifications', title: '3.2 Modificações nos Serviços' },
      { id: 'users', title: '3.3 Usuários e Credenciais' },
      { id: 'support', title: '3.4 Suporte Técnico' },
      { id: 'addons', title: '3.5 Funcionalidades Adicionais' },
      { id: 'beta', title: '3.6 Serviços Beta' }
    ]
  },
  { id: 'restrictions', title: '4. Restrições' },
  { id: 'responsibilities', title: '5. Responsabilidades do TouchKanban' },
  { id: 'privacy', title: '6. Privacidade e Proteção de Dados' },
  { id: 'contact', title: '7. Contato e Suporte' }
];

export default function TermsPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el && mainRef.current) {
      const top = el.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
  <div className="flex flex-col md:flex-row max-w-6xl mx-auto py-10 px-4 gap-8 bg-white text-gray-900 rounded-xl shadow border">
      {/* Sidebar índice */}
  <nav className="md:w-64 mb-8 md:mb-0 sticky top-20 self-start bg-white text-gray-900">
        <h2 className="text-lg font-bold mb-4">Índice</h2>
        <ul className="space-y-2 text-sm">
          {sections.map(sec => (
            <li key={sec.id}>
              <button
                className="text-primary hover:underline text-left w-full"
                onClick={() => scrollToSection(sec.id)}
              >
                {sec.title}
              </button>
              {sec.children && (
                <ul className="ml-4 mt-1 space-y-1">
                  {sec.children.map(child => (
                    <li key={child.id}>
                      <button
                        className="text-muted-foreground hover:underline text-left w-full"
                        onClick={() => scrollToSection(child.id)}
                      >
                        {child.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Conteúdo principal */}
  <div className="flex-1 prose prose-lg max-w-none" ref={mainRef}>
        <h1 className="text-3xl font-bold mb-2">Termos de Serviço TouchKanban</h1>
        <p className="text-muted-foreground mb-6">Atualizado em 15 de setembro de 2025</p>

        <section id="definitions">
          <h2>1. Definições</h2>
          <p>Estes Termos de Serviço regulam o uso do sistema TouchKanban. "Usuário" refere-se à pessoa física ou jurídica que utiliza o sistema. "Serviço" refere-se às funcionalidades oferecidas pela plataforma TouchKanban.</p>
        </section>

        <section id="subscriptions">
          <h2>2. Assinaturas</h2>
          <p>O acesso ao TouchKanban pode ser realizado por meio de planos gratuitos ou pagos. Os detalhes de cada plano, valores e funcionalidades estão disponíveis na área de planos do sistema.</p>
        </section>

        <section id="services">
          <h2>3. Serviços TouchKanban</h2>
          <section id="use">
            <h3>3.1 Uso dos Serviços</h3>
            <p>O usuário compromete-se a utilizar o sistema conforme a legislação vigente e os presentes termos. O uso indevido pode resultar em suspensão ou cancelamento da conta.</p>
          </section>
          <section id="modifications">
            <h3>3.2 Modificações nos Serviços</h3>
            <p>O TouchKanban pode atualizar, modificar ou descontinuar funcionalidades a qualquer momento, visando melhorias ou adequação legal.</p>
          </section>
          <section id="users">
            <h3>3.3 Usuários e Credenciais</h3>
            <p>O usuário é responsável pela guarda e sigilo de suas credenciais de acesso. O compartilhamento de acesso é proibido.</p>
          </section>
          <section id="support">
            <h3>3.4 Suporte Técnico</h3>
            <p>O suporte é oferecido via canais oficiais, conforme disponibilidade e plano contratado.</p>
          </section>
          <section id="addons">
            <h3>3.5 Funcionalidades Adicionais</h3>
            <p>Funcionalidades extras podem ser oferecidas como add-ons, sujeitos a cobrança adicional.</p>
          </section>
          <section id="beta">
            <h3>3.6 Serviços Beta</h3>
            <p>Funcionalidades em versão beta podem apresentar instabilidades e estão sujeitas a alterações sem aviso prévio.</p>
          </section>
        </section>

        <section id="restrictions">
          <h2>4. Restrições</h2>
          <ul>
            <li>É proibido utilizar o sistema para fins ilícitos ou que violem direitos de terceiros.</li>
            <li>Não é permitido tentar acessar áreas restritas ou realizar engenharia reversa.</li>
            <li>O uso de automações não autorizadas pode resultar em bloqueio da conta.</li>
          </ul>
        </section>

        <section id="responsibilities">
          <h2>5. Responsabilidades do TouchKanban</h2>
          <ul>
            <li>Manter o sistema disponível, salvo interrupções programadas ou por motivos de força maior.</li>
            <li>Proteger os dados dos usuários conforme a Política de Privacidade.</li>
            <li>Realizar atualizações e correções de segurança.</li>
          </ul>
        </section>

        <section id="privacy">
          <h2>6. Privacidade e Proteção de Dados</h2>
          <p>O tratamento de dados pessoais segue a legislação vigente e está detalhado na <a href="/privacy" className="text-primary underline">Política de Privacidade</a>.</p>
        </section>

        <section id="contact">
          <h2>7. Contato e Suporte</h2>
          <p>Em caso de dúvidas, sugestões ou solicitações, entre em contato pelo e-mail <a href="mailto:suporte@touchkanban.com" className="underline">suporte@touchkanban.com</a>.</p>
        </section>

        <hr className="my-8" />
        <p className="text-xs text-muted-foreground">Estes termos podem ser atualizados a qualquer momento. Recomendamos revisá-los periodicamente.</p>
      </div>
    </div>
  );
}
