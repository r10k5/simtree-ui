<template>
  <div class="relationship-tree-container">
    <div class="tree-controls">
      <h3>Дерево связей</h3>
      <div class="controls">
        <button class="btn btn-sm" @click="resetZoom">Сбросить масштаб</button>
        <button class="btn btn-sm" @click="toggleLayout">
          {{ isVertical ? 'Горизонтально' : 'Вертикально' }}
        </button>
        <button class="btn btn-sm" @click="expandAll">Развернуть все</button>
        <button class="btn btn-sm" @click="collapseAll">Свернуть все</button>
      </div>
    </div>
    <div ref="treeContainer" class="tree-svg-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import type { Person, Relationship } from '@/types/family'

interface TreeNode {
  id: string
  name: string
  person: Person
  children?: TreeNode[]
  _children?: TreeNode[]
  depth?: number
  x?: number
  y?: number
}

interface Props {
  persons: Person[]
  relationships: Relationship[]
}

const props = defineProps<Props>()

const treeContainer = ref<HTMLElement>()
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let g: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
let tree: d3.TreeLayout<TreeNode> | null = null
let root: TreeNode | null = null
const isVertical = ref(true)

// Tree dimensions
const margin = { top: 20, right: 90, bottom: 30, left: 90 }
const width = 1200
const height = 800

// Build tree data structure
const buildTreeData = (): TreeNode | null => {
  console.log('Building tree data...', {
    personsCount: props.persons.length,
    relationshipsCount: props.relationships.length,
    persons: props.persons.map((p) => ({ id: p.id, name: p.name })),
    relationships: props.relationships.map((r) => ({
      type: r.type,
      person1Id: r.person1Id,
      person2Id: r.person2Id,
      isActive: r.isActive,
    })),
  })
  if (props.persons.length === 0) {
    console.log('No persons found, returning null')
    return null
  }

  // Create a map of persons
  const personMap = new Map<string, Person>()
  props.persons.forEach((person) => {
    personMap.set(person.id, person)
  })

  // Find root nodes (persons without parents)
  const rootPersons = props.persons.filter((person) => {
    return !props.relationships.some(
      (rel) => rel.type === 'parent' && rel.person2Id === person.id && rel.isActive,
    )
  })

  if (rootPersons.length === 0) {
    // If no clear roots, use the first person
    const firstPerson = props.persons[0]
    console.log('No root persons found, using first person as root:', firstPerson.name)
    return {
      id: firstPerson.id,
      name: `${firstPerson.name} ${firstPerson.surname || ''}`.trim(),
      person: firstPerson,
      children: buildChildren(firstPerson.id, personMap, new Set()),
    }
  }

  // If multiple roots, create a virtual root
  if (rootPersons.length > 1) {
    return {
      id: 'virtual-root',
      name: 'Семейное древо',
      person: {} as Person,
      children: rootPersons.map((person) => ({
        id: person.id,
        name: `${person.name} ${person.surname || ''}`.trim(),
        person: person,
        children: buildChildren(person.id, personMap, new Set()),
      })),
    }
  }

  // Single root
  const rootPerson = rootPersons[0]
  console.log('Using root person:', rootPerson.name)
  return {
    id: rootPerson.id,
    name: `${rootPerson.name} ${rootPerson.surname || ''}`.trim(),
    person: rootPerson,
    children: buildChildren(rootPerson.id, personMap, new Set()),
  }
}

// Build children for a given person
const buildChildren = (
  personId: string,
  personMap: Map<string, Person>,
  visited: Set<string> = new Set(),
  depth: number = 0,
): TreeNode[] => {
  // Prevent infinite recursion by checking if we've already visited this person
  if (visited.has(personId)) {
    console.warn(`Circular relationship detected for person ${personId}, skipping`)
    return []
  }

  // Limit depth to prevent very deep trees
  if (depth > 10) {
    console.warn(`Maximum depth reached for person ${personId}, stopping recursion`)
    return []
  }

  // Add current person to visited set
  visited.add(personId)

  const children: TreeNode[] = []

  // Find children (persons where this person is a parent)
  const childRelationships = props.relationships.filter(
    (rel) => rel.type === 'parent' && rel.person1Id === personId && rel.isActive,
  )

  console.log(
    `Building children for ${personId} at depth ${depth}, found ${childRelationships.length} relationships`,
  )

  childRelationships.forEach((rel) => {
    const child = personMap.get(rel.person2Id)
    if (child) {
      children.push({
        id: child.id,
        name: `${child.name} ${child.surname || ''}`.trim(),
        person: child,
        children: buildChildren(child.id, personMap, new Set(visited), depth + 1), // Pass a copy of visited set and increment depth
      })
    }
  })

  return children.length > 0 ? children : []
}

// Alternative simple tree building function for debugging
const buildSimpleTree = (): TreeNode | null => {
  console.log('Building simple tree...')
  if (props.persons.length === 0) {
    return null
  }

  // Just create a flat list of all persons as children of a virtual root
  return {
    id: 'simple-root',
    name: 'Семейное древо',
    person: {} as Person,
    children: props.persons.map((person) => ({
      id: person.id,
      name: `${person.name} ${person.surname || ''}`.trim(),
      person: person,
      children: undefined,
    })),
  }
}

// Initialize D3 tree
const initializeTree = () => {
  console.log('Initializing D3 tree...', { container: treeContainer.value })
  if (!treeContainer.value) {
    console.log('No tree container found!')
    return
  }

  // Clear existing content
  d3.select(treeContainer.value).selectAll('*').remove()

  // Create SVG
  svg = d3
    .select(treeContainer.value)
    .append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)

  // Create main group
  g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Create tree layout
  tree = d3.tree<TreeNode>().size(isVertical.value ? [height, width] : [width, height])

  // Add zoom behavior
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => {
      g?.attr('transform', event.transform.toString())
    })

  svg.call(zoom)

  updateTree()
}

// Update tree visualization
const updateTree = () => {
  console.log('Updating tree visualization...', { g: !!g, tree: !!tree })
  if (!g || !tree) {
    console.log('Missing g or tree, cannot update')
    return
  }

  // Try to build tree data, fallback to simple tree if there are issues
  try {
    root = buildTreeData()
    console.log('Root data:', root)
    if (!root) {
      console.log('No root data, trying simple tree')
      root = buildSimpleTree()
    }
  } catch (error) {
    console.error('Error building tree data:', error)
    console.log('Falling back to simple tree')
    root = buildSimpleTree()
  }

  if (!root) {
    console.log('No root data, cannot update tree')
    return
  }

  // Create D3 hierarchy from our tree data
  const hierarchy = d3.hierarchy(root)

  // Collapse all nodes initially
  collapseAllNodes(root)

  // Update tree layout
  tree(hierarchy)

  // Clear existing nodes
  g.selectAll('.node').remove()
  g.selectAll('.link').remove()

  // Add links
  g.selectAll('.link')
    .data(hierarchy.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', (d) => {
      const source = isVertical.value
        ? { x: d.source.y || 0, y: d.source.x || 0 }
        : { x: d.source.x || 0, y: d.source.y || 0 }
      const target = isVertical.value
        ? { x: d.target.y || 0, y: d.target.x || 0 }
        : { x: d.target.x || 0, y: d.target.y || 0 }
      return `M${source.x},${source.y}C${(source.x + target.x) / 2},${source.y} ${(source.x + target.x) / 2},${target.y} ${target.x},${target.y}`
    })
    .style('fill', 'none')
    .style('stroke', '#ccc')
    .style('stroke-width', '2px')

  // Add nodes
  const nodes = g
    .selectAll('.node')
    .data(hierarchy.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr(
      'transform',
      (d) => `translate(${isVertical.value ? d.y : d.x},${isVertical.value ? d.x : d.y})`,
    )
    .on('click', (event, d) => toggleNode(d))

  // Add circles for nodes
  nodes
    .append('circle')
    .attr('r', 10)
    .style('fill', (d) => {
      if (d.data.id === 'virtual-root') return '#ff6b6b'
      return d.data.person.gender === 'male'
        ? '#4A90E2'
        : d.data.person.gender === 'female'
          ? '#E24A90'
          : '#90E24A'
    })
    .style('stroke', '#fff')
    .style('stroke-width', '2px')

  // Add text labels
  nodes
    .append('text')
    .attr('dy', '.35em')
    .attr('x', (d) => (d.children ? -15 : 15))
    .style('text-anchor', (d) => (d.children ? 'end' : 'start'))
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text((d) => d.data.name)

  // Add occupation text
  nodes
    .append('text')
    .attr('dy', '1.2em')
    .attr('x', (d) => (d.children ? -15 : 15))
    .style('text-anchor', (d) => (d.children ? 'end' : 'start'))
    .style('font-size', '10px')
    .style('fill', '#666')
    .text((d) => d.data.person.occupation || '')

  // Add expand/collapse indicators
  nodes
    .filter((d) => Boolean(d.children && d.children.length > 0))
    .append('text')
    .attr('dy', '.35em')
    .attr('x', -25)
    .style('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .style('fill', '#666')
    .text((d) => (d.children ? '−' : '+'))
}

// Toggle node expansion
const toggleNode = (d: d3.HierarchyNode<TreeNode>) => {
  if (d.children) {
    d.data._children = d.children.map((child) => child.data)
    d.children = undefined
  } else if (d.data._children) {
    d.children = d.data._children.map((childData) => {
      const childNode = d3.hierarchy(childData)
      return childNode
    })
    d.data._children = undefined
  }
  updateTree()
}

// Collapse all nodes
const collapseAllNodes = (node: TreeNode) => {
  if (node.children) {
    node._children = node.children
    node.children = undefined
    node._children.forEach((child) => collapseAllNodes(child))
  }
}

// Expand all nodes
const expandAllNodes = (node: TreeNode) => {
  if (node._children) {
    node.children = node._children
    node._children = undefined
    node.children.forEach((child) => expandAllNodes(child))
  }
}

// Control functions
const resetZoom = () => {
  if (svg) {
    svg
      .transition()
      .duration(750)
      .call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity)
  }
}

const toggleLayout = () => {
  isVertical.value = !isVertical.value
  if (tree) {
    tree.size(isVertical.value ? [height, width] : [width, height])
    updateTree()
  }
}

const expandAll = () => {
  if (root) {
    expandAllNodes(root)
    updateTree()
  }
}

const collapseAll = () => {
  if (root) {
    collapseAllNodes(root)
    updateTree()
  }
}

// Watch for data changes
watch(
  () => [props.persons, props.relationships],
  () => {
    nextTick(() => {
      if (g && tree) {
        updateTree()
      }
    })
  },
  { deep: true },
)

onMounted(() => {
  console.log('RelationshipTree mounted!')
  console.log('Props received:', { persons: props.persons, relationships: props.relationships })
  nextTick(() => {
    console.log('Initializing tree...')
    initializeTree()
  })
})

onUnmounted(() => {
  if (svg) {
    svg.remove()
  }
})
</script>

<style scoped>
.relationship-tree-container {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 10px;
  overflow: hidden;
}

.tree-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tree-controls h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.controls {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tree-svg-container {
  width: 100%;
  height: calc(100% - 60px);
  overflow: hidden;
}

:deep(.link) {
  fill: none;
  stroke: #ccc;
  stroke-width: 2px;
}

:deep(.node circle) {
  cursor: pointer;
}

:deep(.node text) {
  pointer-events: none;
}

:deep(.node:hover circle) {
  stroke-width: 3px;
}
</style>
