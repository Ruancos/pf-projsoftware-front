import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";

export default function Tarefas() {
    const { user, isAuthenticated } = useAuth0();
    const [tarefas, setTarefas] = useState([]);
    const [formData, setFormData] = useState({
        titulo  : "",
        descricao: "",
        dataEntrega: "",
        tipoPrioridade: "",
        emailUsuario: user?.email || "",
    });
    

    useEffect(() => {
        if (isAuthenticated) {
            setFormData((prevData) => ({
                ...prevData,
                emailUsuario: user.email,
            }));
        }
    }, [isAuthenticated, user]);

    const handleInputChange = (e ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }  

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/tarefas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error("Failed to create task");
            }
            const newTarefa = await response.json();
            setTarefas((prevTarefas) => [...prevTarefas, newTarefa]);
            setFormData({
                titulo: "",
                descricao: "",
                dataEntrega: "",
                tipoPrioridade: "",
                emailUsuario: user?.email || "",
            });
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    return (
        <div>
            <h1>Gerenciamento de Tarefas</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="titulo"
                    placeholder="Título"
                    value={formData.titulo}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="descricao"
                    placeholder="Descrição"
                    value={formData.descricao}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="tipoPrioridade"
                    placeholder="Tipo de Prioridade"
                    value={formData.tipoPrioridade}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="emailUsuario"
                    placeholder="Email"
                    value={formData.emailUsuario}
                    onChange={handleInputChange}
                />
                <button type="submit">Criar Tarefa</button>
            </form>
        </div>
    )
}

