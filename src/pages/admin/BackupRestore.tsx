import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonText,
  IonSpinner,
  IonAlert,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonProgressBar,
  IonModal,
  IonTextarea,
  IonFab,
  IonFabButton,
  IonToast,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import {
  arrowBack,
  cloudDownload,
  cloudUpload,
  refresh,
  trash,
  add,
  folderOpen,
  checkmarkCircle,
  warning,
  informationCircle,
  server,
  download,
  time,
  alertCircle,
  document
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { adminBackupService } from '../../services/adminBackupService';
import { authService } from '../../services/authService';
import { environment } from '../../environments/environment';
import './BackupRestore.css';

const BackupRestore: React.FC = () => {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertHeader, setAlertHeader] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    filename?: string;
  } | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const history = useHistory();

  useEffect(() => {
    if (!authService.isAdmin()) {
      history.push('/store');
      return;
    }

    loadBackups();
    loadDatabaseStatus();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await adminBackupService.getBackups();
      setBackups(data.backups || []);
    } catch (error) {
      console.error('Error loading backups:', error);
      showAlertMessage('Error', 'No se pudieron cargar los backups');
    } finally {
      setLoading(false);
    }
  };

  const loadDatabaseStatus = async () => {
    try {
      const status = await adminBackupService.getDatabaseStatus();
      setDbStatus(status.database);
    } catch (error) {
      console.error('Error loading database status:', error);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadBackups();
    await loadDatabaseStatus();
    event.detail.complete();
  };

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      const result = await adminBackupService.createBackup();

      const method = result.method || 'Binary Dump';
      const tablesInfo = result.backup.tables_exported ? ` (${result.backup.tables_exported} tablas)` : '';

      showAlertMessage(
        'Backup Creado',
        `Backup creado exitosamente usando ${method}: ${result.backup.name} (${result.backup.size})${tablesInfo}`
      );

      loadBackups();
      loadDatabaseStatus();
    } catch (error: any) {
      console.error('Error creating backup:', error);
      showAlertMessage('Error', error.message || 'No se pudo crear el backup');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      showToastMessage('Preparando descarga...');
      const blobData = await adminBackupService.downloadBackup(filename);
      const isNative = (window as any).Capacitor?.isNativePlatform();

      if (isNative) {
        // Conversión a Base64 (requerido por Capacitor Filesystem)
        const convertBlobToBase64 = (blob: Blob): Promise<string> =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
              const base64String = reader.result as string;
              resolve(base64String.split(',')[1]);
            };
            reader.readAsDataURL(blob);
          });

        const base64Data = await convertBlobToBase64(blobData);
        
        // Importación dinámica para evitar errores en navegadores web tradicionales
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');

        // Guardar el archivo en la carpeta de Documentos
        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Documents
        });

        console.log('✅ Backup guardado en documentos nativos:', savedFile.uri);

        // Mostrar menú compartir para guardar o enviar el archivo
        try {
          await Share.share({
            title: 'Backup de Base de Datos',
            text: `Archivo de backup: ${filename}`,
            url: savedFile.uri,
            dialogTitle: '¿Qué deseas hacer con el backup?',
          });
          showToastMessage('Descarga finalizada');
        } catch (shareError) {
          console.warn('⚠️ Diálogo de compartir cancelado:', shareError);
          showToastMessage('Backup guardado en carpeta Documentos');
        }
      } else {
        // Crear un enlace temporal para descargar el archivo (Navegador Web)
        const url = window.URL.createObjectURL(blobData);
        const link = window.document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        window.document.body.appendChild(link);
        link.click();
        
        // Limpieza
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToastMessage('Descarga finalizada');
      }
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      showAlertMessage('Error', error.message || 'No se pudo descargar el backup');
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    try {
      await adminBackupService.deleteBackup(filename);
      showAlertMessage('Backup Eliminado', `Backup ${filename} eliminado exitosamente`);
      loadBackups();
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      showAlertMessage('Error', error.message || 'No se pudo eliminar el backup');
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    try {
      setRestoring(true);
      const result = await adminBackupService.restoreBackup(filename);

      showAlertMessage(
        'Base de Datos Restaurada',
        `Base de datos restaurada desde ${result.details.backup_file}. 
        ${result.details.statements_executed} sentencias ejecutadas.`
      );

      // Recargar estado después de restaurar
      setTimeout(() => {
        loadDatabaseStatus();
        showToastMessage('✅ Sistema recargado después de restauración');
        // Recargar la página para reflejar cambios
        setTimeout(() => window.location.reload(), 2000);
      }, 3000);

    } catch (error: any) {
      console.error('Error restoring backup:', error);
      showAlertMessage('Error', error.message || 'No se pudo restaurar el backup');
    } finally {
      setRestoring(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showAlertMessage('Error', 'Por favor selecciona un archivo');
      return;
    }

    // Verificar extensión del archivo
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.dump') && !fileName.endsWith('.sql')) {
      showAlertMessage('Error', 'Solo se permiten archivos .dump (binario) o .sql (texto)');
      return;
    }

    try {
      setUploadProgress(0);
      const result = await adminBackupService.uploadBackup(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setShowUploadModal(false);
      setSelectedFile(null);

      showAlertMessage(
        'Backup Subido y Restaurado',
        `Base de datos restaurada desde ${result.details.original_file}. 
        Tipo: ${result.details.type === 'binary_dump' ? 'Backup binario' : 'Archivo SQL'}
        ${result.details.executed_successfully ? `${result.details.executed_successfully} sentencias ejecutadas` : ''}`
      );

      loadBackups();
      loadDatabaseStatus();

      // Recargar después de restaurar
      setTimeout(() => {
        showToastMessage('✅ Sistema recargado después de restauración');
        setTimeout(() => window.location.reload(), 2000);
      }, 3000);

    } catch (error: any) {
      console.error('Error uploading backup:', error);
      showAlertMessage('Error', error.message || 'No se pudo subir y restaurar el backup');
    }
  };

  const showAlertMessage = (header: string, message: string) => {
    setAlertHeader(header);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (size: string) => {
    return size.replace(' MB', ' MB');
  };

  const confirmActionDialog = (type: string, filename?: string) => {
    setConfirmAction({ type, filename });
    setShowConfirm(true);
  };

  const executeConfirmedAction = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'delete':
        if (confirmAction.filename) {
          handleDeleteBackup(confirmAction.filename);
        }
        break;
      case 'restore':
        if (confirmAction.filename) {
          handleRestoreBackup(confirmAction.filename);
        }
        break;
      case 'create':
        handleCreateBackup();
        break;
    }

    setShowConfirm(false);
    setConfirmAction(null);
  };

  const getConfirmMessage = () => {
    if (!confirmAction) return '';

    switch (confirmAction.type) {
      case 'delete':
        return `¿Estás seguro de que deseas eliminar el backup "${confirmAction.filename}"? Esta acción no se puede deshacer.`;
      case 'restore':
        return `⚠️ ADVERTENCIA: ¿Estás seguro de restaurar la base de datos desde "${confirmAction.filename}"?
        
        • Todos los datos actuales serán reemplazados
        • Esta acción NO se puede deshacer
        • El sistema se reiniciará después de la restauración
        
        Solo continúa si sabes lo que estás haciendo.`;
      case 'create':
        return `¿Deseas crear un nuevo backup de la base de datos? Esto puede tomar varios minutos dependiendo del tamaño.`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando sistema de backup...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <style>{`
        /* Force Dark Mode Local Overrides */
        body.dark .backup-restore-content {
          --background: #121212 !important;
          background: #121212 !important;
        }

        body.dark ion-card,
        body.dark .stat-box,
        body.dark .empty-backups,
        body.dark .backups-list,
        body.dark .info-section ion-card {
          --background: #1e1e1e !important;
          background: #1e1e1e !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }

        body.dark ion-item {
          --background: #1e1e1e !important;
          --color: white !important;
          --border-color: #333 !important;
        }

        body.dark ion-text h2,
        body.dark ion-text h3,
        body.dark ion-text p,
        body.dark ion-text strong,
        body.dark .file-input-label span {
          color: white !important;
        }

        body.dark ion-text[color="medium"],
        body.dark .file-input-label ion-icon {
          color: #aaa !important;
        }

        body.dark .status-footer {
          border-top-color: #333 !important;
        }
        
        /* Fix: Specific Text Visibility */
        body.dark .section-header ion-text, 
        body.dark .section-header h2, 
        body.dark .section-header p {
           color: white !important;
        }

        /* Fix: Centering Database Name */
        .stat-box {
           display: flex !important;
           flex-direction: column !important;
           align-items: center !important;
           justify-content: center !important;
           text-align: center !important;
        }

        /* Modal & Upload Dark Mode */
        body.dark ion-modal ion-content,
        body.dark .upload-section {
           --background: #1e1e1e !important;
           --color: white !important;
        }
        
        body.dark .file-input-label {
           border-color: #444 !important;
           background: rgba(255,255,255,0.05);
        }
        
        body.dark .selected-file {
           background: #2c2c2c !important;
           color: white !important;
        }

        }
      `}</style>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" text="" />
          </IonButtons>
          <IonTitle>Backup & Restauración</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={loadBackups}>
              <IonIcon icon={refresh} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="backup-restore-content admin-backup-page">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {/* Estado de la base de datos */}
        {dbStatus && (
          <div className="database-status-section">
            <IonCard color="light">
              <IonCardContent>
                <div className="status-header">
                  <IonIcon icon={server} size="large" color="primary" />
                  <IonText>
                    <h2>Estado de la Base de Datos</h2>
                    <p>Información actual del sistema</p>
                  </IonText>
                </div>

                <IonGrid>
                  <IonRow>
                    <IonCol size="6" size-md="3">
                      <div className="stat-box">
                        <IonText color="medium">
                          <small>Base de Datos</small>
                        </IonText>
                        <IonText>
                          <h3>{dbStatus.name}</h3>
                        </IonText>
                      </div>
                    </IonCol>

                    <IonCol size="6" size-md="3">
                      <div className="stat-box">
                        <IonText color="medium">
                          <small>Usuarios</small>
                        </IonText>
                        <IonText>
                          <h3>{dbStatus.stats.users}</h3>
                        </IonText>
                      </div>
                    </IonCol>

                    <IonCol size="6" size-md="3">
                      <div className="stat-box">
                        <IonText color="medium">
                          <small>Productos</small>
                        </IonText>
                        <IonText>
                          <h3>{dbStatus.stats.products}</h3>
                        </IonText>
                      </div>
                    </IonCol>

                    <IonCol size="6" size-md="3">
                      <div className="stat-box">
                        <IonText color="medium">
                          <small>Pedidos</small>
                        </IonText>
                        <IonText>
                          <h3>{dbStatus.stats.orders}</h3>
                        </IonText>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <div className="status-footer">
                  <IonText color="medium">
                    <small>
                      <IonIcon icon={time} /> Última verificación: {formatDate(dbStatus.last_check)}
                    </small>
                  </IonText>
                  <IonBadge color="success">
                    <IonIcon icon={checkmarkCircle} /> Conectado
                  </IonBadge>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {/* Panel de acciones */}
        <div className="actions-section">
          <IonGrid>
            <IonRow>
              <IonCol size="12" size-md="4">
                <IonCard button onClick={() => confirmActionDialog('create')} color="primary">
                  <IonCardContent className="action-card">
                    <div className="action-icon">
                      <IonIcon icon={cloudDownload} />
                    </div>
                    <div className="action-content">
                      <IonText color="light">
                        <h3>Crear Backup</h3>
                        <p>Generar copia de seguridad actual</p>
                      </IonText>
                      {creatingBackup && (
                        <IonSpinner name="crescent" color="light" />
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="4">
                <IonCard button onClick={() => setShowUploadModal(true)} color="secondary">
                  <IonCardContent className="action-card">
                    <div className="action-icon">
                      <IonIcon icon={cloudUpload} />
                    </div>
                    <div className="action-content">
                      <IonText color="light">
                        <h3>Subir Backup</h3>
                        <p>Restaurar desde archivo .sql</p>
                      </IonText>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="4">
                <IonCard button onClick={loadBackups} color="tertiary">
                  <IonCardContent className="action-card">
                    <div className="action-icon">
                      <IonIcon icon={refresh} />
                    </div>
                    <div className="action-content">
                      <IonText color="light">
                        <h3>Actualizar Lista</h3>
                        <p>Ver backups disponibles</p>
                      </IonText>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Lista de backups */}
        <div className="backups-list-section">
          <div className="section-header">
            <IonText>
              <h2>Backups Disponibles</h2>
              <p>Total: {backups.length} backups encontrados</p>
            </IonText>
            <IonBadge color="medium">
              {backups.length} / 10 backups máximos
            </IonBadge>
          </div>

          {backups.length === 0 ? (
            <div className="empty-backups">
              <IonIcon icon={folderOpen} size="large" color="medium" />
              <IonText color="medium">
                <h3>No hay backups disponibles</h3>
                <p>Crea tu primer backup para empezar</p>
              </IonText>
            </div>
          ) : (
            <IonList className="backups-list">
              {backups.map((backup, index) => (
                <IonItem key={index} className="backup-item">
                  <div className="backup-info">
                    <IonIcon icon={document} slot="start" color="primary" />
                    <IonLabel>
                      <h3>{backup.name}</h3>
                      <p>
                        <IonText color="medium">
                          <small>
                            <IonIcon icon={time} size="small" />
                            Creado: {formatDate(backup.created)}
                          </small>
                        </IonText>
                      </p>
                      <p>
                        <IonBadge color="light">{backup.size}</IonBadge>
                      </p>
                    </IonLabel>
                  </div>

                  <div className="backup-actions">
                    <IonButton
                      fill="clear"
                      color="primary"
                      onClick={() => handleDownloadBackup(backup.name)}
                    >
                      <IonIcon icon={download} />
                    </IonButton>

                    <IonButton
                      fill="clear"
                      color="warning"
                      onClick={() => confirmActionDialog('restore', backup.name)}
                      disabled={restoring}
                    >
                      <IonIcon icon={refresh} />
                    </IonButton>

                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={() => confirmActionDialog('delete', backup.name)}
                    >
                      <IonIcon icon={trash} />
                    </IonButton>
                  </div>
                </IonItem>
              ))}
            </IonList>
          )}
        </div>

        {/* Información importante */}
        <div className="info-section">
          <IonCard color="warning">
            <IonCardContent>
              <div className="info-header">
                <IonIcon icon={alertCircle} color="warning" />
                <IonText>
                  <h3>⚠️ Información Importante</h3>
                </IonText>
              </div>

              <div className="info-content">
                <IonText>
                  <p>
                    <strong>Recomendaciones de uso:</strong>
                  </p>
                  <ul>
                    <li>Realiza backups regularmente (al menos una vez por semana)</li>
                    <li>Guarda los archivos de backup en un lugar seguro fuera del servidor</li>
                    <li>Verifica que los backups se puedan restaurar correctamente</li>
                    <li>La restauración reemplaza TODOS los datos actuales</li>
                    <li>El sistema se reiniciará automáticamente después de una restauración</li>
                  </ul>

                  <p className="warning-text">
                    <IonIcon icon={warning} />
                    <strong>ADVERTENCIA:</strong> La restauración de backups es una operación
                    destructiva que elimina todos los datos actuales. Úsala con precaución.
                  </p>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>

      {/* Modal para subir archivo */}
      <IonModal isOpen={showUploadModal} onDidDismiss={() => setShowUploadModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Subir Backup</IonTitle>
            <IonButtons slot="start">
              <IonButton onClick={() => setShowUploadModal(false)}>Cancelar</IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton
                onClick={handleFileUpload}
                disabled={!selectedFile || uploadProgress > 0}
              >
                Subir y Restaurar
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="upload-section">
            <IonText>
              <h3>Subir archivo de backup (.sql)</h3>
              <p>Selecciona un archivo de backup para restaurar la base de datos</p>
            </IonText>

            <div className="file-input-container">
              <input
                type="file"
                id="backupFile"
                accept=".dump,.sql"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                  }
                }}
                className="file-input"
              />
              <label htmlFor="backupFile" className="file-input-label">
                <IonIcon icon={cloudUpload} />
                <span>Seleccionar archivo .dump o .sql</span>
              </label>

              {selectedFile && (
                <div className="selected-file">
                  <IonText>
                    <p>
                      <strong>Archivo seleccionado:</strong> {selectedFile.name}
                    </p>
                    <p>
                      <small>
                        Tipo: {selectedFile.name.endsWith('.dump') ? 'Backup binario (.dump)' : 'Archivo SQL (.sql)'}
                      </small>
                    </p>
                    <p>
                      <small>Tamaño: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</small>
                    </p>
                  </IonText>
                </div>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="upload-progress">
                <IonProgressBar value={uploadProgress / 100} />
                <IonText color="medium">
                  <small>Subiendo... {uploadProgress.toFixed(0)}%</small>
                </IonText>
              </div>
            )}

            <div className="upload-warning">
              <IonIcon icon={warning} color="warning" />
              <IonText color="warning">
                <small>
                  <strong>Advertencia:</strong> Al restaurar desde este archivo,
                  todos los datos actuales serán reemplazados.
                </small>
              </IonText>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Alertas */}
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={alertHeader}
        message={alertMessage}
        buttons={['OK']}
      />

      <IonAlert
        isOpen={showConfirm}
        onDidDismiss={() => setShowConfirm(false)}
        header="Confirmar Acción"
        message={getConfirmMessage()}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              setShowConfirm(false);
              setConfirmAction(null);
            }
          },
          {
            text: 'Confirmar',
            role: 'destructive',
            handler: executeConfirmedAction
          }
        ]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
      />

    </IonPage>
  );
};

export default BackupRestore;