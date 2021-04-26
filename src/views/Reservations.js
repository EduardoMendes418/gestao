import React, { useState , useEffect } from 'react';
import { 
    CRow, 
    CCol, 
    CCard, 
    CCardHeader, 
    CCardBody, 
    CButton,
    CDataTable,
    CButtonGroup,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
    CFormGroup,
    CInput,
    CLabel,
    CSelect
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import useApi from '../services/api';

//CARREGAMENTO DE LISTA
export default () => {

    const api = useApi();//chamando api
    const [loading, setLoading] = useState(true);//loading
    const [list, setList] = useState([]); //carregar lista

    //modal
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalTitleField, setModalTitleField] = useState('');
    const [modalFileField, setModalFileField] = useState('');
    const [modalId, setModalId] = useState('');
    const [modalUnitList, setModalUnitList] = useState([]);
    const [modalAreatList, setModalAreaList] = useState([]);
    
    //stande para salvar informações no modal
    const [modalUnitId, setModalUnitlId] = useState(0);
    const [modalAreatId, setModalAreaId] = useState(0);
    const [modalDateField, setModalDateField] = useState('');

    //Criando tabelas
    const fields = [
        {label: 'Unidade', key:'name_unit', sorter:false},
        {label: 'Área', key:'name_area', sorter:false},
        {label: 'Data da reserva', key: 'reservation_date'},
        {label: 'Ações', key: 'actions', _style:{width:'1px'}, sorter:false, filter:false},
    ];

     //Busca Lista, Unidade e Area
    useEffect(() => {  
        getList();
        getUnitList();
        getAreaList();
    },[]);

    //Lista
    const getList = async () => {
        //ativar requisicao
        setLoading(true);
        const result = await api.getReservations(); //criacao na Api
        setLoading(false);

        //resposta result ou error
        if(result.error === ''){
            setList(result.list);
        }else{
            alert(result.error);
        }
    }
    //Unidade 
    const getUnitList = async () =>{
        const result = await api.getUnits(); //criacao na Api
        if(result.error === ''){
            setModalUnitList(result.list);
        }
    }
    //Area  
    const getAreaList = async () =>{
        const result = await api.getAreas(); //criacao na Api
        if(result.error === ''){
            setModalAreaList(result.list);
        }
    }

    //fechar modal
    const handleCloseModal = () => {
        setShowModal(false);
    }
    //modal Editando, pegando informação e exibir no modal
    const handleEditButton = (index) => {
            setModalId(list[index]['id']);
            setModalTitleField(list[index]['title']);
            setModalFileField(list[index]['body']);
            setShowModal(true);
    }
    //modal quando Editar e Salvar os campos
    const handleModalSave = async () => {
        if(modalTitleField){
            //Requisição Modal 
            setModalLoading(true);
            let result;
            let data = {
                title: modalTitleField,
            };
            if(modalId === ''){
                //melhorando documento pdf  
                if(modalFileField){
                    data.file = modalFileField;
                    result = await api.addDocument(data); //criacao na Api
                }else{
                    //se der error
                    alert("Selecione o arquivo !");
                    setModalLoading(false);
                    return;
                } 
            }else{
                //aceitar mesmo se nao editar doc
                if(setModalTitleField){
                    data.file = modalFileField;
                }
                result = await api.updateDocument(modalId, data); //criacao na Api
            }
            setModalLoading(false);
            if(result.error === ''){
                setShowModal(false);
                getList();
            }else{
                alert(result.error);
            }
        }else{
            alert('Preencha os campos !');
        }
    }

    //Remove itens btn excluir documentos 
    const handleRemoveButton = async (index) => {
            if(window.confirm('Tem certeza que deseja excluir?')){
                const result = await api.removeDocument(list[index]['id']); //criacao na Api
                if(result.error === ''){
                    getList();
                }else{
                    alert(result.error);
                }
            }
    }
    //Novo aviso (Limpar Historico  Dash)
    const handleNewButton = () => {
            setModalId('');
            setModalTitleField('');
            setModalFileField('');
            setShowModal(true);
    }
 
  
return (
    <>
    {/*PAGINA AVISOS*/}
    <CRow>
        <CCol>
            <h2> Reservas </h2>
            <CCard>
                <CCardHeader>
                    <CButton 
                    color="primary" 
                    onClick={handleNewButton}
                    disabled={modalUnitList.length===0||modalAreatList.length===0}
                    >
                        <CIcon  name="cil-check" />
                         Nova Reserva
                    </CButton>
                </CCardHeader>
                
                <CCardBody>
                    <CDataTable 
                        items={list}
                        fields={fields}
                        loading={loading}
                        noItemsView=""
                        columnFilter
                        sorter
                        hover
                        striped
                        bordered
                        pagination
                        itemsPerPage={4}
                        //Criacao de Editar e Excluir 
                        scopedSlots={{

                            //Colocarndo  data formatada no campos 
                             'reservation_date': (item) =>(
                                <td>
                                    {item.reservation_date_formatted}
                                </td>
                             ),   

                            //Acao do btn Editar e Remover
                            'actions': (item, index) => (
                                <td>
                                    <CButtonGroup>
                                        <CButton 
                                         color="info" 
                                         onClick={() => handleEditButton(index)}
                                         disabled={modalUnitList.length===0||modalAreatList.length===0}   
                                         >Editar 
                                         </CButton>
                                        
                                        <CButton 
                                        color="danger" 
                                        onClick={() => handleRemoveButton(index)}
                                        >Excluir 
                                        </CButton>
                                    </CButtonGroup>
                                </td>
                            )
                        }}
                    />
                </CCardBody>
            </CCard> 
        </CCol>
    </CRow>

    {/*CORPO MODAL RESERVA*/}
    <CModal show={showModal} onClose={handleCloseModal} >
        <CModalHeader 
        closeButton
        > 
        {modalId === '' ? 'Novo': 'Editar'} Reserva
        </CModalHeader>    
        <CModalBody>
            
            {/* UNIDADE*/}          
            <CFormGroup>
                <CLabel htmlFor="modal-unit">Unidade</CLabel>
                <CSelect
                    id="modal-unit"
                    custom   
                    onChange={e=>setModalUnitlId(e.target.value)}    
                 >
                     {modalUnitList.map((item, index) =>(
                        <option
                            key={index}
                            value={item.id}
                         
                        >{item.name}
                        </option>
                     ))}
                </CSelect>        
            </CFormGroup>

            {/* AREA */}                
             <CFormGroup>
                 <CLabel htmlFor="modal-area">Aréa</CLabel>
                  <CSelect
                    id="modal-area"
                    custom
                    onChange={e=>setModalAreaId(e.target.value)}
                  >
                    {modalAreatList.map((item, index) =>(
                        <option
                            key={index}
                            value={item.id}
                        >{item.title}
                        </option>
                    ))}
                  </CSelect>       
            </CFormGroup>           

            {/*FORMULARIO  Data da reserva*/}
            <CFormGroup>
                <CLabel htmlFor="modal-date"> Data da reserva</CLabel>
                <CInput 
                    type="text"
                    id="modal-date"
                    value={setModalDateField}
                    onChange={e=>setModalDateField(e.target.value)}
                    disabled={modalLoading}
                />
            </CFormGroup> 
           
       
        </CModalBody>

        <CModalFooter>
            <CButton 
            color="primary"
            onClick={handleModalSave}
            disabled={modalLoading}>
            { modalLoading ? 'Carregando...' : 'Salvar'}
            </CButton>

            <CButton 
            color="secondary"
            onClick={handleCloseModal}
            disabled={modalLoading}
            > Cancelar </CButton>
        </CModalFooter>               
    </CModal>
    </>
    
    );
};
