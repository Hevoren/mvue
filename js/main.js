let eventBus = new Vue()

Vue.component('all-notes', {
    template:`
            <div class="all-notes">
                <create-note></create-note>
                <notes></notes>
            </div>
    `,
})

Vue.component('notes', {
    template: `
        <div class="notes">
            <note :column="columns[0]" :errors="errors_1" :name="nameFirst"
                :columnIndex="columnIndex1" :columnLength="columnLength_1"
                @getIndex="getIndex" @increaseLength="increaseLength"
                :isBlocked="isFirstColumnBlocked"
                @drag-start="dragStart" @drag-over="dragOver"
                @drag-leave="dragLeave" @drop="drop"></note>
            <note :column="columns[1]" :errors="errors_2" :name="nameSecond"
                :columnIndex="columnIndex2" :columnLength="columnLength_2"
                @getIndex="getIndex" @increaseLength="increaseLength"
                @drag-start="dragStart" @drag-over="dragOver"
                @drag-leave="dragLeave" @drop="drop"></note>
            <note :column="columns[2]" :errors="errors_3" :name="nameThird"
                :columnIndex="columnIndex3"
                @drag-start="dragStart" @drag-over="dragOver"
                @drag-leave="dragLeave" @drop="drop"></note>
        </div>
    `,

    data() {
        return {
            columns: [
                [],
                [],
                [],
            ],

            errors_1: [],
            errors_2: [],
            errors_3: [],

            nameFirst: 'Begin',
            nameSecond: 'Continue',
            nameThird: 'End',

            columnIndex1: 0,
            columnIndex2: 1,
            columnIndex3: 2,

            columnLength_1: 3,
            columnLength_2: 5,

            draggingTask: null,
            draggingNote: null,
            draggingColumnIndex: null,
            isDraggingOver: false,
        }
    },
    // mounted - вызывается после того, как компонент был добавлен в DOM, т.е. србатывает после того как даннные улетели из формы сюда.
    // после чего он пытается достать и разобрать строку json из localstorage, и если ее нет, присваивает пустой массив
    mounted(){

        const savedColumns = localStorage.getItem('columns');
        if (savedColumns) {
            this.columns = JSON.parse(savedColumns);
        }
        console.log("KK")

        eventBus.$on('notes-submitted', note => {
            this.errors_1 = [];
            if (this.columns[0].length < this.columnLength_1) {
                this.columns[0].push(note);
                this.saveNotes();
            } else {
                this.errors_1.push('GABELLA! Maximum count of tasks!');
            }

        });
    },
    // watch отслеживает изменения, если они есть, то он присваивает и сохраняет новые значения, добавляя их в localstorage и преобразовывая ('stringify') в json формат
    watch: {
        columns: {
            handler: 'saveNotes',
            deep: true
        },
    },
    computed: {
        isFirstColumnBlocked() {
            return this.columns[1].length === this.columnLength_2;
        },
    },
    // saveNote вызывается после выполнения mounted; присваивает и сохраняет значения в localstorage, преобразовывая ('stringify') их в json формат
    methods: {
        dragStart(task) {
            this.draggingTask = task.indexTask;
            this.draggingNote = task.indexNote;
            this.draggingColumnIndex = task.columnIndex;
            console.log(this.draggingNote)
            console.log(this.draggingTask)
            console.log(this.draggingColumnIndex)
        },

        dragOver(task) {
            event.preventDefault();
            if (task.columnIndex === this.draggingColumnIndex && task.indexNote === this.draggingNote && task.indexTask === this.draggingTask) {
                // set isDraggingOver to true to highlight the drop target
                this.isDraggingOver = true;
            }
        },

        dragLeave() {
            this.isDraggingOver = false;
        },

        drop(task) {
            if (this.isDraggingOver && (task.columnIndex === this.draggingColumnIndex && task.indexNote === this.draggingNote && task.indexTask === this.draggingTask)) {
                // remove the dragging task from its original position
                console.log(1123)
                const movedTask = this.columns[this.draggingColumnIndex][this.draggingNote].tasks.splice(this.draggingTask, 1);

                // insert the dragging task to the new position
                this.columns[task.columnIndex][task.indexNote].tasks.splice(task.indexTask, 0, movedTask);

                // reset the dragging properties and save changes
                this.isDraggingOver = false;
                this.draggingTask = null;
                this.draggingNote = null;
                this.draggingColumnIndex = null;
                this.saveNotes();
            }
        },
        saveNotes() {
            localStorage.setItem('columns', JSON.stringify(this.columns));
        },

        getIndex(task) {
            (!this.columns[task.columnIndex][task.indexNote].tasks[task.indexTask].readiness)? this.columns[task.columnIndex][task.indexNote].tasks[task.indexTask].readiness = true : this.columns[task.columnIndex][task.indexNote].tasks[task.indexTask].readiness = false
            let tasking = this.columns[task.columnIndex][task.indexNote]
            this.changeTask(tasking, task)
        },

        dateAdd(tasking){
            let date = new Date()
            let year = date.getFullYear()
            let month = date.getMonth()+1
            let day = date.getDate()
            let time = date.toLocaleTimeString()
            tasking.dateEnd = year + '-' + month + '-' + day + '  ' + time
        },

        increaseLength(length){
            if (length === this.columnLength_1){
                let inc = 1
                length += 1
                this.columnLength_1 = length
            }
            else{
                let inc = 1
                length += 1
                this.columnLength_2 = length
            }

        },

        changeTask(tasking, task){
            let count = tasking.tasks.length;
            let readinessCount = 0;

            for (let i of this.columns[task.columnIndex][task.indexNote].tasks) {
                if (i.readiness === true) {
                    readinessCount += 1;
                }
            }

            if ((readinessCount > count / 2) && (this.columns[task.columnIndex] === this.columns[0])){
                if(this.columns[1].length === this.columnLength_2){
                    this.isFirstColumnBlocked()
                }

                let move = this.columns[task.columnIndex].splice(task.indexNote, 1)
                this.columns[task.columnIndex+1].push(...move)
            }

            if (readinessCount === count && this.columns[task.columnIndex] === this.columns[1]){
                let move = this.columns[task.columnIndex].splice(task.indexNote,1)
                this.dateAdd(tasking)
                this.columns[2].push(...move)
            }
        },
    }

})

Vue.component('note', {
    props: {
        column: {
            type: Array,
            required: true,

        },
        errors: {
            type: Array,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        columnIndex: {
            type: Number,
            required: true
        },
        isBlocked: {
            type: Boolean,
            required: false,
        },
        columnLength: {
            type: Number,
            required: false
        }
    },

    template: `
        <div>
            <div class="title">
                <p style="width: 50%; text-align: center;"><b>{{ name }}</b></p>
                <div style="width: 50%; display: flex; flex-direction: row">
                    <p style="width: 50% text-align: center;" v-show="columnIndex !== 2"><b>Max Length: </b>{{ columnLength }}</p>
                    <button style="width: 40px; height: 40px; margin: 0 auto; border-radius: 50%;" @click="increaseLength(columnLength)"> + 1</button>
                </div>
            </div>
            <div class="note" >
                <h1 v-for="error in errors"> {{ error }}</h1>
                <ul>
                    <li v-for="(note, indexNote) in column" class="li-list" >
                        <h1>{{ note.name }}</h1>
                        
                        <ul>
                            <li class="li-task" v-for="(task, indexTask) in note.tasks" :key="indexTask" :draggable="true" 
                                @dragstart="dragStart(indexNote, columnIndex, indexTask)"
                                @dragover="dragOver(indexNote, columnIndex, indexTask)"
                                @dragleave="dragLeave"
                                @drop="drop(indexNote, columnIndex, indexTask)">
                                <p>{{ task.name }}</p>
                                <p>{{ task.readiness }}</p>
                                
                                <input type="checkbox" @click.stop.prevent="getIndex(indexNote, indexTask, columnIndex, name)" :disabled="isBlocked || task.readiness" :checked="task.readiness">
                            </li>
                            <p>{{ note.dateEnd }}</p>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    `,

    methods: {
        getIndex(indexNote, indexTask, columnIndex, name){
            this.$emit('getIndex', {indexNote, indexTask, columnIndex, name})
        },
        increaseLength(columnLength){
            this.$emit('increaseLength', columnLength)
        },
        dragStart(indexNote, columnIndex, indexTask) {
            this.$emit('drag-start', {indexNote, columnIndex, indexTask});
        },
        dragOver(indexNote, columnIndex, indexTask) {
            event.preventDefault();
            this.$emit('drag-over', {indexNote, columnIndex, indexTask});
        },
        dragLeave(event) {
            this.$emit('drag-leave', this.indexNote, this.columnIndex, this.indexTask);
        },
        drop(indexNote, columnIndex, indexTask) {
            event.preventDefault();
            this.$emit('drop', {indexNote, columnIndex, indexTask});
        }
    },
})

Vue.component('create-note', {
    template: `
        <div class="createNote">
            <form class="createForm" @submit.prevent="onSubmit">
                <p v-if="errors" v-for="error in errors">{{ error }}</p>
                <input type="text" placeholder="Name" id="name" v-model="name" required maxlength="10">
                <input type="text" placeholder="Task 1" id="task_1" v-model="task_1" maxlength="10">
                <input type="text" placeholder="Task 2" id="task_2" v-model="task_2" maxlength="10">
                <input type="text" placeholder="Task 3" id="task_3" v-model="task_3" maxlength="10">
                <input type="text" placeholder="Task 4" id="task_4" v-model="task_4" maxlength="10">
                <input type="text" placeholder="Task 5" id="task_5" v-model="task_5" maxlength="10">
                <button type="submit">Create</button>
            </form>
        </div>  
    `,

    data() {
        return{
            name: null,
            task_1: null,
            task_2: null,
            task_3: null,
            task_4: null,
            task_5: null,
            id: 0,
            all_tasks: [],
            errors: [],
        }
    },

    methods: {
        onSubmit() {
            this.all_tasks = []
            this.errors = []
            this.all_tasks.push(this.task_1, this.task_2, this.task_3, this.task_4, this.task_5)
            this.all_tasks = this.all_tasks.filter(Boolean)
            if (this.all_tasks.length > 2 ){
                let note = {
                    name: this.name,
                    tasks: [
                        {name: this.task_1, readiness: false},
                        {name: this.task_2, readiness: false},
                        {name: this.task_3, readiness: false},
                        {name: this.task_4, readiness: false},
                        {name: this.task_5, readiness: false},
                    ],
                    dateEnd:null,
                }
                note.tasks = this.removeNullTasks(note.tasks)
                eventBus.$emit('notes-submitted', note);
                this.name = null;
                this.task_1 = null;
                this.task_2 = null;
                this.task_3 = null;
                this.task_4 = null;
                this.task_5 = null;
            }else {
                this.all_tasks = []
                this.errors.push("GABELLA! From 3 to 5 tasks!")
            }
        },

        removeNullTasks(arr){
            arr = arr.filter(el => {
                if (el.name !== null || '' || undefined){
                    return el.name;
                }
            })
            return arr
        }

    },
})

let app = new Vue({
    el: '#app',
    data: {
        name: 'Notes',
    }
})