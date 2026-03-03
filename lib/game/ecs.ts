// Entity-Component System for modular game object architecture

export interface IComponent {
  name: string
  enabled: boolean
  onEnable?(): void
  onDisable?(): void
  onDestroy?(): void
  update?(deltaTime: number): void
}

export class Component implements IComponent {
  name: string = 'Component'
  enabled: boolean = true
  entity?: Entity

  onEnable(): void {}
  onDisable(): void {}
  onDestroy(): void {}
  update(deltaTime: number): void {}

  getComponent<T extends Component>(type: new () => T): T | undefined {
    return this.entity?.getComponent(type)
  }
}

export class Entity {
  private components: Map<string, Component> = new Map()
  private childEntities: Map<string, Entity> = new Map()
  
  active: boolean = true

  constructor(
    public id: string,
    public parent?: Entity
  ) {}

  addComponent<T extends Component>(component: T): T {
    const name = component.name || component.constructor.name
    component.entity = this
    this.components.set(name, component)

    if (this.active && component.enabled) {
      component.onEnable()
    }

    return component
  }

  getComponent<T extends Component>(type: new () => T): T | undefined {
    const instance = new type()
    return this.components.get(instance.name) as T | undefined
  }

  removeComponent<T extends Component>(type: new () => T): void {
    const instance = new type()
    const name = instance.name || type.name
    const component = this.components.get(name)

    if (component) {
      if (component.enabled) {
        component.onDisable()
      }
      component.onDestroy()
      this.components.delete(name)
    }
  }

  hasComponent<T extends Component>(type: new () => T): boolean {
    const instance = new type()
    return this.components.has(instance.name)
  }

  getComponents(): Component[] {
    return Array.from(this.components.values())
  }

  addChild(entity: Entity): void {
    entity.parent = this
    this.childEntities.set(entity.id, entity)
  }

  removeChild(id: string): Entity | undefined {
    const child = this.childEntities.get(id)
    if (child) {
      child.parent = undefined
      this.childEntities.delete(id)
    }
    return child
  }

  getChildren(): Entity[] {
    return Array.from(this.childEntities.values())
  }

  setActive(active: boolean): void {
    this.active = active

    this.components.forEach((component) => {
      if (active && !component.enabled) {
        component.onEnable()
      } else if (!active && component.enabled) {
        component.onDisable()
      }
    })

    this.childEntities.forEach((child) => {
      child.setActive(active)
    })
  }

  update(deltaTime: number): void {
    if (!this.active) return

    // Update all components
    this.components.forEach((component) => {
      if (component.enabled) {
        component.update(deltaTime)
      }
    })

    // Update all children
    this.childEntities.forEach((child) => {
      child.update(deltaTime)
    })
  }

  destroy(): void {
    // Destroy all components
    this.components.forEach((component) => {
      if (component.enabled) {
        component.onDisable()
      }
      component.onDestroy()
    })
    this.components.clear()

    // Destroy all children
    this.childEntities.forEach((child) => {
      child.destroy()
    })
    this.childEntities.clear()

    // Remove from parent
    if (this.parent) {
      this.parent.removeChild(this.id)
    }
  }
}

export class Scene {
  private entities: Map<string, Entity> = new Map()
  private rootEntities: Set<string> = new Set()

  createEntity(id: string, parent?: Entity): Entity {
    const entity = new Entity(id, parent)

    this.entities.set(id, entity)

    if (!parent) {
      this.rootEntities.add(id)
    }

    return entity
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id)
  }

  removeEntity(id: string): void {
    const entity = this.entities.get(id)
    if (entity) {
      entity.destroy()
      this.entities.delete(id)
      this.rootEntities.delete(id)
    }
  }

  getRootEntities(): Entity[] {
    return Array.from(this.rootEntities).map((id) => this.entities.get(id)!).filter(Boolean)
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values())
  }

  update(deltaTime: number): void {
    // Update all root entities (which updates their children recursively)
    this.rootEntities.forEach((id) => {
      const entity = this.entities.get(id)
      if (entity) {
        entity.update(deltaTime)
      }
    })
  }

  clear(): void {
    this.entities.forEach((entity) => {
      entity.destroy()
    })
    this.entities.clear()
    this.rootEntities.clear()
  }
}
