const KEY_BD = '@usuariosestudo'

var listaRegistros = {
    ultimoIdGerado:0,
    usuarios:[]
}


var FILTRO = ''

async function carregarReg()
{
    const respose = await fetch('http://localhost:59771/api/Desenvolvedores')
    const data = await respose.json()
    listaRegistros.usuarios = data
}

async function gravarBD(usuario){

    try {
        usuario.DataNascimento = usuario.DataNascimento + 'T00:00:00'
        const body = JSON.stringify(usuario)
        const respose = await fetch('http://localhost:59771/api/Desenvolvedores', { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 
    body})
    
    return await respose.json()
        
    } catch (error) {
        
    }
}

function lerBD(){
    const data = localStorage.getItem(KEY_BD)
    if(data){
        listaRegistros = JSON.parse(data)
    }
    desenhar()
}


function pesquisar(value){
    FILTRO = value;
    desenhar()
}


function desenhar(){
    const tbody = document.getElementById('listaRegistrosBody')
    if(tbody){
        var data = listaRegistros.usuarios;
        if(FILTRO.trim()){
            const expReg = eval(`/${FILTRO.trim().replace(/[^\d\w]+/g,'.*')}/i`)
            data = data.filter( usuario => {
                return expReg.test( usuario.Nome ) || expReg.test( usuario.fone )
            } )
        }
        data = data
            .sort( (a, b) => {
                return a.Id > b.Id ? -1 : 1
            })
            .map( usuario => {
                return `<tr>
                        <td>${usuario.Id}</td>
                        <td>${usuario.Nome}</td>
                        <td>${usuario.Sexo}</td>
                        <td>${usuario.Idade}</td>
                        <td>${usuario.DataNascimento}</td>
                        <td>${usuario.Hobby}</td>
                        <td>
                            <button onclick='vizualizar("cadastro",false,${usuario.Id})'>Editar</button>
                            <button class='vermelho' onclick='perguntarSeDeleta(${usuario.Id})'>Deletar</button>
                        </td>
                    </tr>`
            } )
        tbody.innerHTML = data.join('')
    }
}

async function insertUsuario(Nome, Sexo , Idade, DataNascimento, Hobby){
    Idade = parseInt(Idade)
    const novoUsuario = await gravarBD({Nome, Sexo, Idade, DataNascimento, Hobby})
    listaRegistros.usuarios.push(novoUsuario)
    desenhar()
    vizualizar('lista')
}

async function editUsuario(Id, Nome, Sexo, Idade, DataNascimento, Hobby){
    var usuario = listaRegistros.usuarios.find( usuario => usuario.Id == Id )
    const index = listaRegistros.usuarios.indexOf(usuario) 
    usuario.Nome = Nome;
    usuario.Sexo = Sexo;
    usuario.Idade = Idade;
    usuario.DataNascimento = DataNascimento;
    usuario.Hobby = Hobby;
    const usuarioEditado = await gravarBD(usuario)
    listaRegistros.usuarios[index] = usuarioEditado
    desenhar()
    vizualizar('lista')
}

async function deleteUsuario(Id){
    await excluirDB(Id)
    listaRegistros.usuarios = listaRegistros.usuarios.filter( usuario => {
        return usuario.Id != Id
    } )
    desenhar()
}

async function excluirDB(Id){
    await fetch(`http://localhost:59771/api/Desenvolvedores/${Id}`, {method: 'DELETE'})
}

function perguntarSeDeleta(Id){
    if(confirm('Deseja deletar o registro de id '+Id)){
        deleteUsuario(Id)
    }
}


function limparEdicao(){
    document.getElementById('name').value = ''
    document.getElementById('datanascimento').value = ''
    document.getElementById('sexo').value = ''
    document.getElementById('hobby').value = ''
}

function vizualizar(pagina, novo=false, Id=null){
    document.body.setAttribute('page',pagina)
    if(pagina === 'cadastro'){
        if(novo) limparEdicao()
        if(Id){
            const usuario = listaRegistros.usuarios.find( usuario => usuario.Id == Id )
            console.log(usuario)
            if(usuario){
                document.getElementById('id').value = usuario.Id
                document.getElementById('name').value = usuario.Nome
                document.getElementById('sexo').value = usuario.Sexo
                document.getElementById('idade').value = usuario.Idade
                document.getElementById('datanascimento').value = usuario.DataNascimento
                document.getElementById('hobby').value = usuario.Hobby
            }
        }
        document.getElementById('name').focus()
    }
}

function submeter(e){
    e.preventDefault()
    const data = {
        Id: document.getElementById('id').value,
        Nome: document.getElementById('name').value,
        Sexo: document.getElementById('sexo').value,
        Idade: document.getElementById('idade').value,
        DataNascimento: document.getElementById('datanascimento').value,
        Hobby: document.getElementById('hobby').value,
    }
    if(data.Id){
        editUsuario(data.Id, data.Nome, data.Sexo, data.Idade, data.DataNascimento, data.Hobby)
    }else{
        insertUsuario( data.Nome, data.Sexo, data.Idade, data.DataNascimento, data.Hobby )
    }
}


window.addEventListener('load', () => {
    lerBD()
    document.getElementById('cadastroRegistro').addEventListener('submit', submeter)
    document.getElementById('inputPesquisa').addEventListener('keyup', e => {
        pesquisar(e.target.value)
    })
    carregarReg()
    desenhar()
})