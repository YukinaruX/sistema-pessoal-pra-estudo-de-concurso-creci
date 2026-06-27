import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { AuthContext } from './authContext.js';

// Monitora a sessão do Supabase Auth e expõe ações de login/cadastro/logout.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setSession(data.session ?? null);
      setCarregando(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao ?? null);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const entrar = useCallback(
    (email, senha) => supabase.auth.signInWithPassword({ email, password: senha }),
    []
  );

  const cadastrar = useCallback(
    (email, senha, nome) =>
      supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome: nome?.trim() || '' } },
      }),
    []
  );

  const sair = useCallback(() => supabase.auth.signOut(), []);

  const resetarSenha = useCallback(
    (email) =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      }),
    []
  );

  const atualizarSenha = useCallback(
    (novaSenha) => supabase.auth.updateUser({ password: novaSenha }),
    []
  );

  const valor = {
    session,
    user: session?.user ?? null,
    carregando,
    entrar,
    cadastrar,
    sair,
    resetarSenha,
    atualizarSenha,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
