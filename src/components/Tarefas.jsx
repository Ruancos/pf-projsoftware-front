import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'

const tarefasUrl = '/api/tarefas'

function getErrorMessage(error) {
    return error instanceof Error
        ? error.message
        : 'Não foi possível concluir a operação.'
}

export default function Tarefas() {
    const { user, isAuthenticated } = useAuth0()
    const [tarefas, setTarefas] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        dataEntrega: '',
        tipoPrioridade: '',
        emailUsuario: user?.email || '',
    })

    useEffect(() => {
        if (!isAuthenticated) return

        setFormData((prevData) => ({
            ...prevData,
            emailUsuario: user?.email || '',
        }))

        let active = true
        setIsLoading(true)
        setErrorMessage('')

        fetch(tarefasUrl)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Não foi possível carregar as tarefas.')
                }

                const data = await response.json()
                if (!Array.isArray(data)) {
                    throw new Error('A resposta da API não contém uma lista de tarefas.')
                }

                return data
            })
            .then((data) => {
                if (active) setTarefas(data)
            })
            .catch((error) => {
                if (active) setErrorMessage(getErrorMessage(error))
            })
            .finally(() => {
                if (active) setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [isAuthenticated, user?.email])

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setErrorMessage('')

        try {
            const response = await fetch(tarefasUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Não foi possível criar a tarefa.')
            }

            const newTarefa = await response.json()
            setTarefas((prevTarefas) => [...prevTarefas, newTarefa])
            setFormData({
                titulo: '',
                descricao: '',
                tipoPrioridade: '',
                emailUsuario: user?.email || '',
            })
        } catch (error) {
            setErrorMessage(getErrorMessage(error))
        }
    }

    const handleDelete = async (id) => {
        setErrorMessage('')

        try {
            const response = await fetch(`${tarefasUrl}/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Não foi possível excluir a tarefa.')
            }

            setTarefas((prevTarefas) => prevTarefas.filter((tarefa) => tarefa.id !== id))
        } catch (error) {
            setErrorMessage(getErrorMessage(error))
        }
    }

    return (
        <section className="tasks-panel">
            <div className="tasks-heading">
                <div>
                    <span className="eyebrow">Organização</span>
                    <h2>Gerenciamento de tarefas</h2>
                </div>
                <span className="task-count">{tarefas.length} tarefa(s)</span>
            </div>

            <form className="task-form" onSubmit={handleSubmit}>
                <label>
                    Título
                    <input
                        type="text"
                        name="titulo"
                        placeholder="Ex.: Entregar trabalho"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Descrição
                    <input
                        type="text"
                        name="descricao"
                        placeholder="Descreva a tarefa"
                        value={formData.descricao}
                        onChange={handleInputChange}
                    />
                </label>
                <label>
                    Prioridade
                    <input
                        type="text"
                        name="tipoPrioridade"
                        placeholder="Ex.: Alta"
                        value={formData.tipoPrioridade}
                        onChange={handleInputChange}
                    />
                </label>
                <button className="primary-button task-submit" type="submit">
                    Criar tarefa
                </button>
            </form>

            {errorMessage && <p className="tasks-error">{errorMessage}</p>}

            <div className="tasks-list">
                {isLoading ? (
                    <p className="tasks-empty">Carregando tarefas...</p>
                ) : tarefas.length === 0 ? (
                    <p className="tasks-empty">Nenhuma tarefa cadastrada.</p>
                ) : (
                    tarefas.map((tarefa) => (
                        <article className="task-item" key={tarefa.id}>
                            <div>
                                <h3>{tarefa.titulo}</h3>
                                {tarefa.descricao && <p>{tarefa.descricao}</p>}
                                <div className="task-meta">
                                    {tarefa.tipoPrioridade && (
                                        <span>{tarefa.tipoPrioridade}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                className="delete-button"
                                type="button"
                                onClick={() => handleDelete(tarefa.id)}
                            >
                                Excluir
                            </button>
                        </article>
                    ))
                )}
            </div>
        </section>
    )
}
