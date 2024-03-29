import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Proyecto } from 'src/app/model/Proyecto';
import { DocumentosService } from 'src/app/services/documentos.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ProyectoService } from 'src/app/services/proyecto.service';
import { Comentario, Etapa, EtapaProyecto } from 'src/app/model/Comentario';
import { DomSanitizer } from '@angular/platform-browser';
import { Evaluacion } from 'src/app/model/Evaluacion';
import { Institucion } from 'src/app/model/Institucion';
import { Usuario } from 'src/app/model/Usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ElementoUtils, EtapaUtils, Role } from 'src/app/model/Utils';
import { ElementoProyecto } from 'src/app/model/ElementoProyecto';
import { Departamento } from 'src/app/model/Departamento';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { Municipio } from 'src/app/model/Municipio';
import { Titulo } from 'src/app/model/Titulo';
import { TituloService } from 'src/app/services/titulo.service';
import { PersonaService } from 'src/app/services/persona.service';
import { DescargasService } from 'src/app/services/descargas.service';
import { Convocatoria } from 'src/app/model/Convocatoria';
import { Acta } from 'src/app/model/Acta';

interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}

@Component({
    templateUrl: './proyecto.component.html',
    providers: [ConfirmationService, MessageService]
})

export class ProyectoComponent implements OnInit {
    idProyecto!: number;
    proyecto!: Proyecto;
    //asesoresTecnicos: Usuario[] = [];
    asesoresTecnicosAny: any[] = [];
    asesoresTecnicosNuevosAny: any[] = [];
    comentarios: Comentario[] = [];
    totalpages: number = 1;
    currentPage: number = 0;
    loading: boolean = false;
    titulos!: Titulo[];
    //elementos del proyecto
    elementoTitulo: ElementoProyecto = {};
    elementoAnteproyecto?: ElementoProyecto;
    elementoInscripcion?: ElementoProyecto;
    elementoPropedeutico?: ElementoProyecto;
    elementoNacimiento?: ElementoProyecto;
    elementoCarta?: ElementoProyecto;
    elementoFiniquito?: ElementoProyecto;
    elementoConvocatoriaAnteproyecto?: ElementoProyecto;
    elementoConvocatoriaAnteproyectoFirmada?: ElementoProyecto;
    elementoCartaAceptacionContraparte?: ElementoProyecto;

    departamentos!: Departamento[];
    departamentoSeleccionado!: Departamento;
    departamentoFiltrado!: Departamento[];
    municipios!: Municipio[];
    municipioSeleccionado!: Municipio;
    municipioFiltrado!: Municipio[];

    tagMsg!: string;

    tituloBloqueado: boolean = true;
    semestreBloqueado: boolean = true;
    anteproyectoBloqueado: boolean = true;
    inscripcionBloqueado: boolean = true;
    propedeuticoBloqueado: boolean = true;
    nacimientoBloqueado: boolean = true;
    cartaBloqueado: boolean = true;
    finiquitoBloqueado: boolean = true;
    convocatoriaAnteproyectoBloqueado: boolean = true;
    convocatoriaAnteproyectoFirmadaBloqueado: boolean = true;
    cartaAceptacionContraparteBloqueado: boolean = true;

    editarInstitucion: boolean = false;
    editarAsesor: boolean = false;
    editarContraparte: boolean = false;

    modoEdicion: boolean = false;
    proyectoEditable: boolean = false;
    rolUsuario: string = "";

    isEstudiante: boolean = false;

    guardar: boolean = false;
    aprobacionAsesor: boolean = false;
    mostrarInformacionEstudiante: boolean = true;
    convocatoriaFirmada: any;
    convocatoriaUrl: any = '';
    boton2: any = {
        mostrar: false
    }
    boton1: any = {
        mostrar: false
    }
    boton3: any = {
        mostrar: false
    }

    convocatoriaGenerada!: Convocatoria;
    actaGenerada!: Acta;
    semestres: any = ['Primer Semestre', 'Segundo Semestre'];

    //etapaProyectoActiva!: EtapaProyecto;
    idEtapaActiva!: number;
    usuarioAsesor!: Usuario;
    institucion!: Institucion;
    link!: any;
    text: string = '';
    textCambios: string = '';
    opcion: any;
    items: any[] = [
        { label: 'Proyecto' },
        { label: 'Institucion' },
        { label: 'Asesores' },
        { label: 'Estudiante' }
    ];
    resultadoProyecto!: Evaluacion;
    fechaEvaluacion!: Evaluacion;
    activeIndex: number = 0;
    visible: boolean = false;
    notaDialogVisible: boolean = false;
    value1: number = 0;
    comentario: any;
    opciones: MenuItem[] = [
        {
            label: 'Cambiar Supervisor',
            icon: 'pi pi-fw pi-users',
            visible: this.authService.hasRole(Role.CoordinadorEps),
            command: () => {
                this.cambiarSupervisor();
            }
        },
        {
            label: 'Cambiar Asesor',
            icon: 'pi pi-fw pi-users',
            visible: this.authService.hasRole(Role.Supervisor) ||
                this.authService.hasRole(Role.CoordinadorEps),
            command: () => {
                this.cambiarAsesor();
            }
        },
        {
            label: 'Cambiar Contraparte',
            icon: 'pi pi-fw pi-users',
            visible: this.authService.hasRole(Role.Supervisor) ||
                this.authService.hasRole(Role.CoordinadorEps),
            command: () => {
                this.cambiarContraparte();
            }
        },
        {
            label: 'Documentos',
            icon: 'pi pi-fw pi-book',
            command: () => {
                this.cambiarContraparte();
            }
        }
    ];


    constructor(private confirmationService: ConfirmationService, private messageService: MessageService, private location: Location,
        private documentosService: DocumentosService, private router: Router, private authService: AuthService,
        private proyectoService: ProyectoService, private sanitizer: DomSanitizer, private usuarioService: UsuarioService,
        private departamentoService: DepartamentoService, private tituloService: TituloService,
        private personaService: PersonaService, private descargasService: DescargasService) { }


    ngOnInit() {
        this.rolUsuario = this.authService.getUserRole();
        this.loading = true;
        this.getIdProyecto();
        this.proyectoService.getProyectoPorId(this.idProyecto).subscribe(proyecto => {
            this.proyecto = proyecto;
            this.saveIdproyecto();
            this.getTituloUsuario();
            this.getDepartementos();
            this.getElementosDeProyecto();
            this.getDepartamento();
            this.getComentarios();
            this.getUsuariosAsignados();
            this.getAsesoresTecnicos();
            this.getEtapaActiva();
        }, (error) => {
            //this.router.navigate(['notfound']);
        }
        )
    }
    saveIdproyecto() {
        sessionStorage.setItem('idProyecto', JSON.stringify(this.idProyecto));
    }

    getTituloUsuario() {
        this.tituloService.getTitulos().subscribe(titulos => this.titulos = titulos);
    }
    getDepartementos() {
        this.departamentoService.getDepartamentos().subscribe(departamentos => this.departamentos = departamentos);
    }

    getIdProyecto() {
        this.idProyecto = (this.location.getState() as { data: number }).data;
        if (this.idProyecto == undefined) {
            const storedIdProyecto = sessionStorage.getItem('idProyecto');
            this.idProyecto = storedIdProyecto ? JSON.parse(storedIdProyecto) : undefined;
        }
        if (this.idProyecto == undefined) {
            this.router.navigate(['gestiones/proyectos']);
        }
    }
    getComentarios() {
        this.proyectoService.getComentarios(this.idProyecto, this.currentPage, 5).subscribe(response => {
            this.comentarios = response.content;
            this.totalpages = response.totalPages;
        })
    }
    getAsesoresTecnicos() {
        this.proyectoService.getAsesoresTecnicos(this.idProyecto).subscribe(asesoresTecnicos => {
            for (let asesorTecnico of asesoresTecnicos) {
                this.asesoresTecnicosAny.push({ edicion: false, asesor: asesorTecnico });
            }
        })
    }
    getDepartamento() {
        this.departamentoService.getDepartamento(this.proyecto.institucion!.municipio!.idMunicipio)
            .subscribe(departamento => {
                this.departamentoSeleccionado = departamento
                this.departamentoService.getMunicipios(this.departamentoSeleccionado.idDepartamento)
                    .subscribe(municipios => this.municipios = municipios);
            });
    }
    getEtapaActiva() {
        this.proyectoService.getEtapaActiva(this.idProyecto).subscribe(etapaProyectoActiva => {
            this.idEtapaActiva = etapaProyectoActiva.etapa.idEtapa;
            this.proyectoEditable = etapaProyectoActiva.editable;
            if (this.proyectoEditable) {
                if (this.authService.getUserRole() == Role.Estudiante) {
                    this.modoEdicion = true;
                }
            }
            this.opcionesEtapaProyecto();
            this.loading = false;
        })
    }

    getUsuariosAsignados() {
        this.proyectoService.getPersonaAsesor(this.idProyecto).subscribe(asesor => {
            this.proyecto.asesor = asesor;
        });
        this.proyectoService.getPersonaContraparte(this.idProyecto).subscribe(contraparte => {
            this.proyecto.contraparte = contraparte;
        });
    }

    getElementosDeProyecto() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_TITULO).subscribe(elementoProyecto => {
            this.elementoTitulo = elementoProyecto;
        });
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_ANTEPROYECTO).subscribe(elementoProyecto => {
            this.elementoAnteproyecto = elementoProyecto;
        });
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_INSCRIPCION).subscribe(elementoProyecto => {
            this.elementoInscripcion = elementoProyecto;
        });
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_PROPEDEUTICO).subscribe(elementoProyecto => {
            this.elementoPropedeutico = elementoProyecto;
        });
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_NACIMIENTO).subscribe(elementoProyecto => {
            this.elementoNacimiento = elementoProyecto;
        });
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_CARTA).subscribe(elementoProyecto => {
            this.elementoCarta = elementoProyecto;
        });
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_FINIQUITO).subscribe(elementoProyecto => {
            this.elementoFiniquito = elementoProyecto;
        });
    }

    opcionesEtapaProyecto() {
        switch (this.idEtapaActiva) {
            case EtapaUtils.CREACION_PROYECTO:
                this.etapaCreacion();
                break;
            case EtapaUtils.REVISION_SECRETARIA:
                this.etapaRevisionSecretaria();
                break;
            case EtapaUtils.REVISION_SUPERVISOR:
                this.etapaRevisionSupervisor();
                break;
            case EtapaUtils.DEFINIR_FECHA_EVALUACION:
                this.etapaDefinirEvaluacion();
                break;
            case EtapaUtils.CARGA_CONVOCATORIA:
                this.etapaCargarConvocatoria();
                this.getConvocatoria();
                break;
            case EtapaUtils.SUBIR_NOTA:
                this.getConvocatoria();
                this.etapaIngresarNota();
                break;
            case EtapaUtils.HABILITAR_BITACORA:
                this.getActa();
                this.etapaHabilitacionBitacora();
                break;
            case EtapaUtils.BITACORA:
                this.etapaBitacora();
                break;
            default:
                break;
        }
    }

    getUserRol(): string {
        return this.authService.getUserRole();
    }

    etapaCreacion() {
        if (this.authService.getUserRole() == Role.Estudiante) {
            if (this.modoEdicion) {
                this.boton2 = {
                    accion: this.solicitarRevision.bind(this),
                    mostrar: this.modoEdicion,
                    icono: 'pi pi-send',
                    titulo: 'Solicitar Revision'
                }
            }

        }
    }


    etapaRevisionSecretaria() {
        if (this.authService.getUserRole() == Role.Secretaria) {

        } else if (this.authService.getUserRole() == Role.Estudiante) {
            this.boton2 = {
                accion: this.solicitarRevision.bind(this),
                mostrar: this.modoEdicion,
                icono: 'pi pi-send',
                titulo: 'Solicitar Revision'
            }
        }
    }

    etapaRevisionSupervisor() {
        if (this.authService.getUserRole() == Role.Supervisor) {
            this.boton1 = {
                accion: this.showDialog.bind(this),
                mostrar: !this.modoEdicion,
                icono: 'pi pi-comment',
                titulo: 'Solicitar Cambios'
            }
            this.boton2 = {
                accion: this.aprobarCambiosSupervisor.bind(this),
                mostrar: !this.modoEdicion,
                icono: 'pi pi-chevron-right',
                titulo: 'Aprobar'
            }
        } else if (this.authService.getUserRole() == Role.Estudiante) {
            this.boton2 = {
                accion: this.solicitarRevision.bind(this),
                mostrar: this.modoEdicion,
                icono: 'pi pi-send',
                titulo: 'Solicitar Revision'
            }
        }
    }

    getConvocatoria() {
        this.proyectoService.getConvocatoriaAnteproyecto(this.idProyecto).subscribe(convocatoria => {
            this.convocatoriaGenerada = convocatoria;
        });
    }

    getActa() {
        this.proyectoService.getActaAnteproyecto(this.idProyecto).subscribe(acta => {
            this.actaGenerada = acta;
        })
    }

    etapaDefinirEvaluacion() {
        if (this.authService.getUserRole() == Role.Supervisor) {
            this.boton2 = {
                accion: this.definirEvaluacion.bind(this),
                mostrar: true,
                icono: 'pi pi-pencil',
                titulo: 'Generar Convocatoria'
            }
        }
    }

    etapaCargarConvocatoria() {
        if (this.authService.getUserRole() == Role.CoordinadorEps) {
            this.convocatoriaAnteproyectoFirmadaBloqueado = false;
            this.elementoConvocatoriaAnteproyectoFirmada = {};
        }
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_CONVOCATORIA_ANTEPROYECTO).subscribe(elementoProyecto => {
            this.elementoConvocatoriaAnteproyecto = elementoProyecto;
        });
    }

    modificarEvaluacion() {
        this.router.navigate(['gestiones/definir-evaluacion'], { state: { data: this.proyecto.idProyecto } });
    }

    etapaIngresarNota() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_CONVOCATORIA_ANTEPROYECTO_FIRMADA).subscribe(elementoProyecto => {
            this.elementoConvocatoriaAnteproyectoFirmada = elementoProyecto;
        });
        if (this.authService.getUserRole() == Role.Supervisor) {
            this.boton1 = {
                accion: this.modificarEvaluacion.bind(this),
                mostrar: true,
                icono: 'pi pi-calendar-times',
                titulo: 'Modificar Convocatoria'
            }
            this.boton2 = {
                accion: this.crearActaAnteproyecto.bind(this),
                mostrar: true,
                icono: 'pi pi-pencil',
                titulo: 'Crear Acta de Anteproyecto'
            }
        }
    }

    etapaHabilitacionBitacora() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_CARTA_ACEPTACION_CONTRAPARTE).subscribe(elementoProyecto => {
            this.elementoCartaAceptacionContraparte = elementoProyecto;
        }, (error) => {
            this.cartaAceptacionContraparteBloqueado = false;
            this.elementoCartaAceptacionContraparte = {};
        });
    }

    etapaBitacora() {
        if (this.authService.getUserRole() == Role.Estudiante) {
            this.opciones.push({
                label: 'Finalizar Bitacora',
                icon: 'pi pi-fw pi-book',
                command: () => {
                    this.finalizarBitacora();
                }
            })
        }
    }

    etapaMostrarResultado() {
        this.proyectoService.getResultado(this.idProyecto).subscribe(evaluacion => {
            this.resultadoProyecto = evaluacion;
        });
    }

    crearActaAnteproyecto() {
        this.router.navigate(['gestiones/evaluar-proyecto'], { state: { data: this.idProyecto } });
    }

    guardarConvocatoria() {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: '¿Estas seguro de subir la convocatoria seleccionada?',
            acceptLabel: "Si",
            icon: 'pi pi-check',
            accept: () => {
                this.proyectoService.cargarConvocatoria(this.idProyecto, this.elementoConvocatoriaAnteproyectoFirmada?.file).subscribe(proyecto => {
                    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Se ha cargado la convocatoria exitosamente' });
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                });
            }
        });
    }

    guardarCartaAceptacion() {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: '¿Estas seguro de subir la carta de aceptacion?',
            acceptLabel: "Si",
            icon: 'pi pi-check',
            accept: () => {
                this.proyectoService.cargarCartaAceptacionContraparte(this.idProyecto, this.elementoCartaAceptacionContraparte?.file).subscribe(proyecto => {
                    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Se ha cargado la convocatoria exitosamente' });
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                });
            }
        });
    }

    finalizarBitacora() {
        this.router.navigate(['bitacoras/finalizar-bitacora'], { state: { idProyecto: this.idProyecto } });
    }

    listaProyectos() {
        this.router.navigate(['gestiones/listado']);
    }

    cargarConvocatoria(event: any) {
        this.convocatoriaFirmada = event.currentFiles[0];
        this.boton3.mostrar = false;

        const reader = new FileReader();
        reader.onload = (e: any) => {

            let blob = new Blob([this.convocatoriaFirmada], { type: this.convocatoriaFirmada.type });
            let url = window.URL.createObjectURL(blob);

            this.convocatoriaUrl = this.sanitizer.bypassSecurityTrustUrl(url);

        };
        reader.readAsDataURL(this.convocatoriaFirmada);

        this.boton1 = {
            accion: this.cancelarCambios.bind(this),
            mostrar: true,
            icono: 'pi pi-times',
            titulo: 'Cancelar'
        }
        this.boton2 = {
            accion: this.guardarConvocatoria.bind(this),
            mostrar: true,
            icono: 'pi pi-save',
            titulo: 'Guardar'
        }

    }

    createDownloadUrl(fileContent: string): string {
        const blob = new Blob([fileContent], { type: 'application/octet-stream' });
        return URL.createObjectURL(blob);
    }

    solicitarRevision() {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: 'Una vez solicites la revision del proyecto no podras hacer mas cambios, ¿quieres confirmar?',
            acceptLabel: "Si",
            icon: 'pi pi-check',
            accept: () => {
                this.proyectoService.solicitarRevision(this.idProyecto).subscribe(proyecto => {
                    this.modoEdicion = false;
                    this.proyectoEditable = false;
                    this.boton2.mostrar = false;
                    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Solicitud enviada', detail: 'Se ha solicitado la revision del proyecto' });
                }, (error) => {
                    this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: 'Se produjo un error al solicitar la revision' });
                });
            }
        });
    }

    cancelarCambios() {
        window.location.reload();
    }

    showDialog() {
        this.visible = true;
    }

    onActiveIndexChange(event: any) {
        this.activeIndex = event;
    }

    mostraOpciones(): boolean {
        if (this.authService.getUserRole() == Role.Secretaria) {
            return true;
        }
        return false;
    }

    definirEvaluacion() {
        this.router.navigate(['gestiones/definir-evaluacion'], { state: { data: this.proyecto.idProyecto } });
    }

    aprobarCambiosSecretaria() {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: '¿Estas seguro de aprobar estos documentos e informacion?',
            acceptLabel: "Si",
            icon: 'pi pi-check',
            accept: () => {
                this.proyectoService.aprobacionSecretaria(this.idProyecto).subscribe(proyecto => {
                    this.proyectoEditable = true;
                    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios aprobados', detail: 'Se han aprobado los cambios exitosamente' });
                    setTimeout(() => {
                        this.router.navigate(['/gestiones/listado']);
                    }, 2000);
                }, (error) => {
                    console.log('error: ', error)
                    this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'Error: ' + error.error });
                });
            }
        });

    }

    aprobarCambiosSupervisor() {
        this.router.navigate(['gestiones/asignar-usuario'],
            { state: { idProyecto: this.idProyecto, idPersona: this.proyecto.asesor?.idUsuario, opcion: 1 } });
    }

    habilitarBitacora() {
        this.router.navigate(['gestiones/asignar-usuario'],
            { state: { idProyecto: this.idProyecto, idPersona: this.proyecto.contraparte?.idUsuario, opcion: 2 } });
    }

    downloadFile(file: any): String {
        let fileUrl = '';
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const fileContent = e.target.result;
            fileUrl = URL.createObjectURL(fileContent);
        };
        reader.readAsDataURL(file);
        return fileUrl;
    }

    comentar() {
        if (this.text) {
            this.proyectoService.comentar(this.idProyecto, { comentario: this.text }).subscribe(comentario => {
                this.comentarios.unshift(comentario);
            });
            this.text = '';
        } else {
            console.log('Textarea is empty');
        }
    }

    solicitarCambios() {
        if (this.textCambios && this.textCambios != '') {
            this.proyectoService.solicitarCambios(this.idProyecto, { comentario: this.textCambios }).subscribe(
                comentario => {
                    this.proyectoEditable = true;
                    this.visible = false;
                    this.comentarios.unshift(comentario);
                    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios solicitados', detail: 'Se han solicitado los cambios al estudiante' });
                });
        } else {
            console.log('Textarea is empty');
        }
    }

    /*
    cargarComentario(etapa: Etapa) {
        this.proyectoService.getComentariosEtapa(this.proyecto.idProyecto, etapa.id!).subscribe(comentarios => etapa.comentarios = comentarios);
        etapa.activo = true;
        console.log('comentarios: ', etapa.comentarios);
    }*/

    descargar(elementoProyecto: ElementoProyecto) {
        this.descargasService.descargar(elementoProyecto.informacion!).subscribe(
            response => {
                window.open(response.link.toString(), '_blank');
            },
            error => console.log('Error getting documento:', error)
        );
    }

    onUploadConstancia(event: any, documento: any) {
        documento = event.currentFiles[0];
    }

    isFieldInvalid(field: any): boolean {
        if (field == undefined && this.guardar) {
            return true;
        } else if (typeof field === 'string') {
            return this.guardar && field.trim() === '';
        }
        return false;
    }

    validarCampos(obj: any, excludeFields: string[]): boolean {
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && !excludeFields.includes(key)) {
                const value = obj[key];
                if (value === undefined || (typeof value === 'string' && value.trim() === '')) {
                    return false;
                }
            }
        }
        return true;
    }

    cargarElementoProyecto(event: any, elementoProyecto: ElementoProyecto) {
        elementoProyecto.file = event.currentFiles[0];
    }

    modificarSemestreProyecto() {
        this.semestreBloqueado = false;
    }

    cancelarSemestreProyecto() {
        this.proyectoService.getProyectoPorId(this.idProyecto).subscribe(proyecto => {
            this.semestreBloqueado = true;
            this.proyecto.semestre = proyecto.semestre;
        })
    }

    guardarSemestreProyecto() {
        this.proyectoService.actualizarProyecto(this.idProyecto, this.proyecto).subscribe(proyecto => {
            this.semestreBloqueado = true;
            this.proyecto.semestre = proyecto.semestre;
            this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Dato se ha actualizado exitosamente.' });
        })
    }

    //Elemento titulo acciones

    modificarElementoTitulo() {
        this.tituloBloqueado = false;
        if (this.elementoTitulo == undefined) {
            this.elementoTitulo = {}
        }
    }


    cancelarElementoTitulo() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_TITULO).subscribe(elementoProyecto => {
            this.elementoTitulo = elementoProyecto;
            this.tituloBloqueado = true;
        }, (error) => {
        })
    }

    guardarElementoTitulo() {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: '¿Estas seguro de guardar titulo?',
            acceptLabel: "Si",
            icon: 'pi pi-check',
            accept: () => {
                this.proyectoService.agregarElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_TITULO, this.elementoTitulo).subscribe(
                    elementoProyecto => {
                        this.elementoTitulo = elementoProyecto;
                        this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Se cambiado el titulo exitosamente.' });
                        this.tituloBloqueado = true;
                    }, (error) => {
                        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'No se pudo cambiar el titulo del proyecto' });
                    }
                )
            }
        });
    }

    //Elemento Anteproyecto Acciones

    modificarElementoAnteproyecto() {
        this.anteproyectoBloqueado = false;
        this.elementoAnteproyecto = {};
    }

    cancelarElementoAnteproyecto() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_ANTEPROYECTO).subscribe(elementoProyecto => {
            this.elementoAnteproyecto = elementoProyecto;
            this.anteproyectoBloqueado = true;
        }, (error) => {
            //if (error.status != 404) 
            this.elementoAnteproyecto = undefined;
            this.anteproyectoBloqueado = true;
        })
    }

    guardarElementoAnteproyecto() {
        this.proyectoService.agregarElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_ANTEPROYECTO, this.elementoAnteproyecto!)
            .subscribe(elementoProyecto => {
                this.elementoAnteproyecto = elementoProyecto;
                this.anteproyectoBloqueado = true;
                this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Se cambiado el anteproyecto exitosamente.' });
            }, (error) => {
                this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'No se pudo cambiar el anteproyecto' });
            })
    }

    //Inscripcion

    modificarElementoInscripcion() {
        this.inscripcionBloqueado = false;
        this.elementoInscripcion = {};
    }

    cancelarElementoInscripcion() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_INSCRIPCION).subscribe(elementoProyecto => {
            this.elementoInscripcion = elementoProyecto;
            this.inscripcionBloqueado = true;
        }, (error) => {
            this.inscripcionBloqueado = true;
            this.elementoInscripcion = undefined
        })
    }

    guardarElementoInscripcion() {
        this.proyectoService.agregarElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_INSCRIPCION, this.elementoInscripcion!)
            .subscribe(elementoProyecto => {
                this.elementoAnteproyecto = elementoProyecto;
                this.inscripcionBloqueado = true;
                this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Se cambiado la constancia de inscripcion exitosamente.' });
            }, (error) => {
                this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'No se pudo cambiar la constancia de inscripcion' });
            })
    }

    //Propedeutico

    modificarElementoPropedeutico() {
        this.propedeuticoBloqueado = false;
        this.elementoPropedeutico = {};
    }

    cancelarElementoPropedeutico() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_PROPEDEUTICO).subscribe(elementoProyecto => {
            this.elementoPropedeutico = elementoProyecto;
            this.propedeuticoBloqueado = true;
        }, (error) => {
            this.propedeuticoBloqueado = true;
            this.elementoPropedeutico = undefined;
        })
    }

    guardarElementoPropedeutico() {
        this.proyectoService.agregarElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_PROPEDEUTICO, this.elementoPropedeutico!)
            .subscribe(elementoProyecto => {
                this.elementoPropedeutico = elementoProyecto;
                this.propedeuticoBloqueado = true;
                this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Se cambiado la constancia de propedeutico exitosamente.' });
            }, (error) => {
                this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'No se pudo cambiar la constancia de propedeutico' });
            })
    }

    //nacimiento

    modificarElementoNacimiento() {
        this.nacimientoBloqueado = false;
        this.elementoNacimiento = {};
    }

    cancelarElementoNacimiento() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_NACIMIENTO).subscribe(elementoProyecto => {
            this.elementoNacimiento = elementoProyecto;
            this.nacimientoBloqueado = true;
        }, (error) => {
            this.nacimientoBloqueado = true;
            this.elementoNacimiento = undefined;
        })
    }

    guardarElementoNacimiento() {
        this.proyectoService.agregarElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_NACIMIENTO, this.elementoNacimiento!)
            .subscribe(elementoProyecto => {
                this.elementoNacimiento = elementoProyecto;
                this.nacimientoBloqueado = true;
                this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Se ha cambiado el certificado de nacimiento exitosamente.' });
            }, (error) => {
                this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'No se pudo cambiar el certificado de nacimiento' });
            })
    }

    //carta

    modificarElementoCarta() {
        this.cartaBloqueado = false;
        this.elementoCarta = {};
    }

    cancelarElementoCarta() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_CARTA).subscribe(elementoProyecto => {
            this.elementoCarta = elementoProyecto;
            this.cartaBloqueado = true;
        }, (error) => {
            this.cartaBloqueado = true;
            this.elementoCarta = undefined;
        })
    }

    guardarElementoCarta() {
        this.proyectoService.agregarElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_CARTA, this.elementoCarta!)
            .subscribe(elementoProyecto => {
                this.elementoCarta = elementoProyecto;
                this.cartaBloqueado = true;
                this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Se ha cambiado la carta de asesor exitosamente.' });
            }, (error) => {
                this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'No se pudo cambiar la carta de asesor' });
            })
    }

    //Finiquito AEIO

    modificarElementoFiniquito() {
        this.finiquitoBloqueado = false;
        this.elementoFiniquito = {};
    }

    cancelarElementoFiniquito() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_FINIQUITO).subscribe(elementoProyecto => {
            this.elementoFiniquito = elementoProyecto;
            this.finiquitoBloqueado = true;
        }, (error) => {
            this.elementoFiniquito = undefined;
            this.finiquitoBloqueado = true;
        })
    }

    guardarElementoFiniquito() {
        this.proyectoService.agregarElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_FINIQUITO, this.elementoFiniquito!)
            .subscribe(elementoProyecto => {
                this.elementoFiniquito = elementoProyecto;
                this.finiquitoBloqueado = true;
                this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Se cambiado finiquito AEIO exitosamente.' });
            }, (error) => {
                this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'No se pudo cambiar el finiquito AEIO' });
            })
    }

    guardarElementoConvocatoriaAnteproyectoFirmada() {
        this.proyectoService.agregarElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_CONVOCATORIA_ANTEPROYECTO_FIRMADA, this.elementoConvocatoriaAnteproyectoFirmada!)
            .subscribe(elementoProyecto => {
                this.elementoConvocatoriaAnteproyectoFirmada = elementoProyecto;
                this.convocatoriaAnteproyectoFirmadaBloqueado = true;
                this.messageService.add({ key: 'tst', severity: 'success', summary: 'Cambios guardados', detail: 'Se cambiado finiquito AEIO exitosamente.' });
            }, (error) => {
                this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'No se pudo cambiar el finiquito AEIO' });
            })
    }

    cancelarElementoConvocatoriaAnteproyectoFirmada() {
        window.location.reload();
    }

    filtrarDepartamento(event: AutoCompleteCompleteEvent) {
        let filtered: Departamento[] = [];
        let query = event.query;

        for (let i = 0; i < (this.departamentos as Departamento[]).length; i++) {
            let departamento = (this.departamentos as Departamento[])[i];
            if (departamento.nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(departamento);
            }
        }
        this.departamentoFiltrado = filtered;
    }

    filtrarMunicipio(event: AutoCompleteCompleteEvent) {
        let filtered: Municipio[] = [];
        let query = event.query;

        for (let i = 0; i < (this.municipios as Municipio[]).length; i++) {
            let municipio = (this.municipios as Municipio[])[i];
            if (municipio.nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(municipio);
            }
        }
        this.municipioFiltrado = filtered;
    }

    cambiarDepartamento(departamento: Departamento) {
        this.departamentoService.getMunicipios(departamento.idDepartamento)
            .subscribe(municipios => this.municipios = municipios);
    }

    cancelarEdicionInstitucion() {
        this.editarInstitucion = false;
        this.proyectoService.getInstitucion(this.idProyecto).subscribe(institucion => {
            this.proyecto.institucion = institucion;
            this.departamentoService.getDepartamento(this.proyecto.institucion!.municipio!.idMunicipio)
                .subscribe(departamento => {
                    this.departamentoSeleccionado = departamento
                    this.departamentoService.getMunicipios(this.departamentoSeleccionado.idDepartamento)
                        .subscribe(municipios => this.municipios = municipios);
                });
        })
    }

    guardarInstitucion() {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: '¿Estas seguro de los cambios?',
            acceptLabel: "Si",
            icon: 'pi pi-check',
            accept: () => {
                this.proyectoService.actualizarInstitucion(this.idProyecto, this.proyecto.institucion!).subscribe(
                    institucion => {
                        this.proyecto.institucion = institucion;
                        this.editarInstitucion = false;
                        this.messageService.add({
                            key: 'tst', severity: 'success',
                            summary: 'Cambios guardados', detail: 'Se ha han guardado los cambios exitosamente'
                        });
                    }
                )
            }
        });
    }

    cancelarEdicionContraparte() {
        this.personaService.getPersona(this.proyecto.contraparte!.idUsuario!.toString()).subscribe(contraparte => {
            this.editarContraparte = false;
            this.proyecto.contraparte = contraparte;
        });
    }

    guardarContraparte() {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: '¿Estas seguro de los cambios?',
            acceptLabel: "Si",
            icon: 'pi pi-check',
            accept: () => {
                this.proyectoService.actualizarPersona(this.idProyecto, this.proyecto.contraparte!.idUsuario!, this.proyecto.contraparte!).subscribe(
                    contraparte => {
                        this.proyecto.contraparte = contraparte;
                        this.editarContraparte = false;
                        this.messageService.add({
                            key: 'tst', severity: 'success',
                            summary: 'Cambios guardados', detail: 'Se ha han guardado los cambios exitosamente'
                        });
                    }
                )
            }
        });
    }

    cancelarEdicionAsesor() {
        this.personaService.getPersona(this.proyecto.asesor!.idUsuario!.toString()).subscribe(asesor => {
            this.proyecto.asesor = asesor;
            this.editarAsesor = false;
        })
    }

    guardarAsesor(idAsesor: String) {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: '¿Estas seguro de guardar los cambios?',
            acceptLabel: "Si",
            icon: 'pi pi-check',
            accept: () => {
                this.proyectoService.actualizarPersona(this.idProyecto, idAsesor, this.proyecto.asesor!).subscribe(
                    asesor => {
                        this.proyecto.asesor = asesor;
                        this.editarAsesor = false;
                        this.messageService.add({
                            key: 'tst', severity: 'success',
                            summary: 'Cambios guardados', detail: 'Se ha han guardado los cambios exitosamente'
                        });
                    }
                )
            }
        });
    }

    cambiarAsesor() {
        this.router.navigate(['gestiones/cambiar-usuario'], { state: { data: this.idProyecto, opc: 1 } });
    }

    cambiarSupervisor() {
        this.router.navigate(['gestiones/cambiar-usuario'], { state: { data: this.idProyecto, opc: 2 } });
    }

    cambiarContraparte() {
        this.router.navigate(['gestiones/cambiar-usuario'], { state: { data: this.idProyecto, opc: 3 } });
    }

    agregarAsesorTecnico() {
        const nuevoAsesor: Usuario = {
            nombreCompleto: "",
            correo: "",
            direccion: "",
            dpi: "",
            telefono: "",
            numeroColegiado: "",
            //titulo: undefined,
        };
        this.asesoresTecnicosNuevosAny.push({ edicion: true, asesor: nuevoAsesor });
    }

    guardarNuevoAsesorTecnico(asesor: any) {
        if (this.validarCampos(asesor.asesor, [])) {
            this.confirmationService.confirm({
                key: 'confirm1',
                message: '¿Estas seguro guardar el asesor tecnico?',
                acceptLabel: "Si",
                icon: 'pi pi-check-circle',
                accept: () => {
                    this.proyectoService.agregarAsesorTecnicos(this.idProyecto, asesor.asesor).subscribe(asesoresTecnico => {
                        this.asesoresTecnicosAny.push({ edicion: false, asesor: asesoresTecnico });
                        this.cancelarAsesorTecnico(asesor);
                        this.messageService.add({
                            key: 'tst', severity: 'success',
                            summary: 'Cambios guardados', detail: 'Se ha registrado el asesor exitosamente'
                        });
                    }, (error) => {
                        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: 'No se pudo guardar el asesor tecnico' });
                    });
                }
            });
        }
    }

    eliminarFiniquito() {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: '¿Estas seguro de eliminar el finiquito?',
            acceptLabel: "Si",
            icon: 'pi pi-trash',
            accept: () => {
                console.log('elemento: ', this.elementoFiniquito);
                this.proyectoService.desactivarElementoProyecto(this.elementoFiniquito!.idElementoProyecto!)
                    .subscribe(response => {
                        this.elementoFiniquito = undefined;
                        this.messageService.add({
                            key: 'tst', severity: 'success',
                            summary: 'Finiquito eliminado', detail: 'Se ha eliminado el finiquito exitosamente'
                        });
                    });
            }
        });
    }

    cancelarAsesorTecnico(asesor: any) {
        this.asesoresTecnicosNuevosAny = this.asesoresTecnicosNuevosAny.filter((asesorTecnico) => asesorTecnico != asesor);
    }

    cancelarEdicionAsesorTecnico(asesor: any) {
        console.log('hey');
        this.personaService.getPersona(asesor.asesor.idUsuario).subscribe(asesorR => {
            asesor.asesor = asesorR;
            asesor.edicion = false;
        });
    }

    guardarAsesorTecnico(asesor: any) {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: '¿Estas seguro de guardar los cambios?',
            acceptLabel: "Si",
            icon: 'pi pi-check-circle',
            accept: () => {
                console.log('asesor:', asesor);
                this.proyectoService.actualizarPersona(this.idProyecto, asesor.asesor.idUsuario, asesor.asesor).subscribe(asesorR => {
                    asesor.asesor = asesorR;
                    asesor.edicion = false;
                    this.mensajeExito("Cambios guardados", "se ha guardado los cambios realizados exitosamente");
                });
            }
        });
    }

    eliminarAsesorTecnico(asesor: any) {
        this.confirmationService.confirm({
            key: 'confirm1',
            message: '¿Estas seguro de eliminar asesor tecnico?',
            acceptLabel: "Si",
            icon: 'pi pi-trash',
            accept: () => {
                this.proyectoService.eliminarAsesorTecnicos(this.idProyecto, asesor.asesor.idUsuario).subscribe(response => {
                    this.asesoresTecnicosAny = this.asesoresTecnicosAny.filter((asesorTecnico) => asesorTecnico != asesor);
                    this.mensajeExito("Asesor Tecnico eliminado", "Se elimino el asesor tecnico exitosamente")
                });
            }
        });
    }

    cargarMasComentarios() {
        this.currentPage++;
        this.proyectoService.getComentarios(this.idProyecto, this.currentPage, 5).subscribe(response => {
            this.comentarios = this.comentarios.concat(response.content);
        })
    }

    mensajeExito(summary: string, detail: string) {
        this.messageService.add({
            key: 'tst', severity: 'success',
            summary: summary, detail: detail
        });
    }
}
