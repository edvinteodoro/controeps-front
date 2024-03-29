import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Proyecto } from 'src/app/model/Proyecto';
import { Router } from '@angular/router';
import { ProyectoService } from 'src/app/services/proyecto.service';
import { Usuario } from 'src/app/model/Usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ElementoUtils, Role } from 'src/app/model/Utils';
import { ElementoProyecto } from 'src/app/model/ElementoProyecto';

@Component({
    templateUrl: './cambiarUsuario.component.html',
    providers: [ConfirmationService, MessageService]
})

export class CambiarUsuarioComponent implements OnInit {
    idProyecto!: number;
    proyecto!: Proyecto;
    elementoTitulo!: ElementoProyecto;
    usuario: Usuario = {
        nombreCompleto: '',
        carreras: []
    };
    opcion!: Number;
    opciones: any[] = [{ label: 'Buscar', value: 'buscar' }, { label: 'Crear', value: 'crear' }];
    valor: string = 'buscar';

    usuariosLista!: Usuario[];
    usuarioSeleccionado!: Usuario;

    nombresFiltro!: String;
    colegiadoFiltro!: String;

    constructor(private location: Location, private router: Router,
        private proyectoService: ProyectoService, private usuarioService: UsuarioService,
        private messageService: MessageService) { }


    ngOnInit() {
        this.idProyecto = (this.location.getState() as { data: number }).data;
        this.opcion = (this.location.getState() as { opc: Number }).opc;
        if (this.idProyecto == undefined) {
            const storedIdProyecto = sessionStorage.getItem('idProyecto');
            this.idProyecto = storedIdProyecto ? JSON.parse(storedIdProyecto) : undefined;
        }
        if (this.idProyecto != undefined && this.opcion != undefined) {
            this.proyectoService.getProyectoPorId(this.idProyecto).subscribe(proyecto => {
                this.proyecto = proyecto;
                this.getTituloProyecto();
                this.getUsuario();
            })
        } else {
            this.router.navigate(['gestiones/proyecto']);
        }
    }

    getTituloProyecto() {
        this.proyectoService.getElementoProyecto(this.idProyecto, ElementoUtils.ID_ELEMENTO_TITULO).subscribe(elementoProyecto => {
            this.elementoTitulo = elementoProyecto;
            //this.loading = false;
        });
    }

    getUsuario() {
        if (this.opcion === 1) {
            this.proyectoService.getPersonaAsesor(this.idProyecto).subscribe(asesor => {
                this.usuario = asesor;
                this.usuarioService.getUsuarios(0, 15, Role.ID_ASESOR).subscribe(response => {
                    this.usuariosLista = response.content;
                })
            });
        } else if (this.opcion === 2) {
            this.proyectoService.getSupervisor(this.idProyecto).subscribe(supervisor => {
                this.usuario = supervisor;
                this.usuarioService.getUsuarios(0, 15, Role.ID_SUPERVISOR).subscribe(response => {
                    this.usuariosLista = response.content;
                })
            });
        } else if (this.opcion === 3) {
            this.proyectoService.getSupervisor(this.idProyecto).subscribe(supervisor => {
                this.usuario = supervisor;
                this.usuarioService.getUsuarios(0, 15, Role.ID_CONTRAPARTE).subscribe(response => {
                    this.usuariosLista = response.content;
                })
            });
        }
    }

    isFieldInvalid(field: any): boolean {
        if (field == undefined) {
            return true;
        } else if (typeof field === 'string') {
            return field.trim() === '';
        }
        return false;
    }

    getCarrerasString(usuario: Usuario): string {
        return usuario.carreras!.map(carrera => carrera.nombre).join(', ');
    }

    regresar() {
        this.router.navigate(['gestiones/listado']);
    }

    buscar() {
        if (this.opcion === 1) {
            this.usuarioService.getUsuarios(0, 10, Role.ID_ASESOR, this.nombresFiltro, this.colegiadoFiltro).subscribe(response => this.usuariosLista = response.context);
        }
    }

    aceptar() {
        if (this.usuarioSeleccionado != null) {

        }
    }

    cambiarSupervisor() {
        this.proyectoService.actualizarSupervisorProyecto(this.idProyecto, this.usuarioSeleccionado).subscribe(() => {
            this.messageService.add({ key: 'tst', severity: 'success', summary: 'Supervisor asignado', detail: 'Se ha asignado supervisor exitosamente.' });
            setTimeout(() => {
                this.router.navigate(['gestiones/proyecto']);
            }, 2000);
        });
    }

    cambiarAsesor() {
        this.proyectoService.actualizarAsesorProyecto(this.idProyecto, this.usuarioSeleccionado).subscribe(() => {
            this.messageService.add({ key: 'tst', severity: 'success', summary: 'Asesor asignado', detail: 'Se ha asignado asesor exitosamente.' });
            setTimeout(() => {
                this.router.navigate(['gestiones/proyecto']);
            }, 2000);
        });
    }

    cambiarContraparte() {
        this.proyectoService.actualizarContraparteProyecto(this.idProyecto, this.usuarioSeleccionado).subscribe(() => {
            this.messageService.add({ key: 'tst', severity: 'success', summary: 'Responsable de contraparte asignado', detail: 'Se ha asignado responsable de contraparte exitosamente.' });
            setTimeout(() => {
                this.router.navigate(['gestiones/proyecto']);
            }, 2000);
        });
    }

    regresarProyecto() {

    }
}
