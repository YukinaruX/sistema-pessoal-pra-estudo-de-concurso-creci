import { useEffect, useState } from 'react';
import { Plus, Trash2, CalendarDays, Save } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { planoFromRow, planoItemFromRow } from '../lib/mappers.js';
import { corDisciplina } from '../styles/theme.js';
import { diasAteProva } from '../lib/estatisticas.js';
import { useAuth } from '../hooks/useAuth.js';
import Loading from '../components/shared/Loading.jsx';

const DISCIPLINAS = [
  'Português',
  'Matemática',
  'Noções de Informática',
  'Conhecimentos Específicos',
  'Legislação e Ética',
];

const STATUS = {
  pendente: { rotulo: 'Pendente', cor: 'var(--texto-fraco)' },
  em_andamento: { rotulo: 'Em andamento', cor: 'var(--alerta)' },
  concluido: { rotulo: 'Concluído', cor: 'var(--sucesso)' },
};

export default function PlanoEstudos() {
  const { user } = useAuth();
  const [plano, setPlano] = useState(null);
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [dataProva, setDataProva] = useState('');
  const [salvandoData, setSalvandoData] = useState(false);

  // formulário de novo item
  const [novo, setNovo] = useState({ disciplina: DISCIPLINAS[0], assunto: '', dataPlanejada: '' });

  useEffect(() => {
    (async () => {
      try {
        setCarregando(true);
        let { data: planos, error } = await supabase
          .from('planos_estudo')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);
        if (error) throw error;

        let p = planos?.[0];
        if (!p) {
          const { data: criado, error: e2 } = await supabase
            .from('planos_estudo')
            .insert({ user_id: user.id, titulo: 'Meu plano CRECI-BA' })
            .select('*')
            .single();
          if (e2) throw e2;
          p = criado;
        }
        const planoMap = planoFromRow(p);
        setPlano(planoMap);
        setDataProva(planoMap.dataProva || '');

        const { data: its, error: e3 } = await supabase
          .from('plano_itens')
          .select('*')
          .eq('plano_id', p.id)
          .order('data_planejada', { ascending: true, nullsFirst: false });
        if (e3) throw e3;
        setItens((its || []).map(planoItemFromRow));
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [user.id]);

  async function salvarDataProva() {
    setSalvandoData(true);
    const { error } = await supabase
      .from('planos_estudo')
      .update({ data_prova: dataProva || null })
      .eq('id', plano.id);
    if (error) setErro(error.message);
    else setPlano((p) => ({ ...p, dataProva }));
    setSalvandoData(false);
  }

  async function adicionarItem(e) {
    e.preventDefault();
    if (!novo.assunto.trim()) return;
    const { data, error } = await supabase
      .from('plano_itens')
      .insert({
        plano_id: plano.id,
        disciplina: novo.disciplina,
        assunto: novo.assunto.trim(),
        data_planejada: novo.dataPlanejada || null,
        status: 'pendente',
      })
      .select('*')
      .single();
    if (error) return setErro(error.message);
    setItens((arr) => [...arr, planoItemFromRow(data)]);
    setNovo({ disciplina: novo.disciplina, assunto: '', dataPlanejada: '' });
  }

  async function mudarStatus(item, status) {
    setItens((arr) => arr.map((i) => (i.id === item.id ? { ...i, status } : i)));
    const { error } = await supabase.from('plano_itens').update({ status }).eq('id', item.id);
    if (error) setErro(error.message);
  }

  async function remover(item) {
    setItens((arr) => arr.filter((i) => i.id !== item.id));
    const { error } = await supabase.from('plano_itens').delete().eq('id', item.id);
    if (error) setErro(error.message);
  }

  if (carregando) return <Loading texto="Carregando plano…" />;

  const dias = diasAteProva(plano?.dataProva);

  return (
    <div className="grid" style={{ gap: 18 }}>
      <h1 style={{ fontSize: 28 }}>Plano de estudos</h1>

      {erro && <div className="card" style={{ borderColor: 'var(--erro)' }}>{erro}</div>}

      <div className="card" style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label className="campo">
            <CalendarDays size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Data da prova
          </label>
          <input type="date" className="input" value={dataProva} onChange={(e) => setDataProva(e.target.value)} />
        </div>
        <button className="btn btn-secundario" onClick={salvarDataProva} disabled={salvandoData}>
          <Save size={16} /> Salvar
        </button>
        {dias != null && (
          <div
            className="badge"
            style={{ background: 'var(--gradiente)', fontSize: 14, padding: '10px 16px' }}
          >
            {dias >= 0 ? `${dias} dias até a prova` : 'Prova já realizada'}
          </div>
        )}
      </div>

      <form className="card" onSubmit={adicionarItem}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Novo item</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', alignItems: 'end' }}>
          <div>
            <label className="campo">Disciplina</label>
            <select
              className="input"
              value={novo.disciplina}
              onChange={(e) => setNovo({ ...novo, disciplina: e.target.value })}
            >
              {DISCIPLINAS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="campo">Assunto</label>
            <input
              className="input"
              value={novo.assunto}
              onChange={(e) => setNovo({ ...novo, assunto: e.target.value })}
              placeholder="Ex.: Crase, Lei 6.530/78…"
            />
          </div>
          <div>
            <label className="campo">Data planejada</label>
            <input
              type="date"
              className="input"
              value={novo.dataPlanejada}
              onChange={(e) => setNovo({ ...novo, dataPlanejada: e.target.value })}
            />
          </div>
          <button className="btn btn-primario" type="submit">
            <Plus size={17} /> Adicionar
          </button>
        </div>
      </form>

      <div className="grid" style={{ gap: 10 }}>
        {itens.length === 0 && <p className="muted-sm">Nenhum item ainda. Adicione assuntos ao seu cronograma.</p>}
        {itens.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, flexWrap: 'wrap', borderLeft: `4px solid ${corDisciplina(item.disciplina)}` }}
          >
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: corDisciplina(item.disciplina) }}>
                  {item.disciplina}
                </span>
                <strong style={{ textDecoration: item.status === 'concluido' ? 'line-through' : 'none' }}>
                  {item.assunto}
                </strong>
              </div>
              {item.dataPlanejada && (
                <div className="muted-sm" style={{ marginTop: 4 }}>
                  📅 {new Date(`${item.dataPlanejada}T00:00:00`).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>

            <select
              className="input"
              value={item.status}
              onChange={(e) => mudarStatus(item, e.target.value)}
              style={{ maxWidth: 170, color: STATUS[item.status].cor, fontWeight: 600 }}
            >
              {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.rotulo}
                </option>
              ))}
            </select>

            <button className="btn btn-fantasma" onClick={() => remover(item)} title="Remover">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
