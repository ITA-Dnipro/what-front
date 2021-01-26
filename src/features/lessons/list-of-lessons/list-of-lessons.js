import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { paths, useActions } from '@/shared';
import { currentUserSelector, fetchLessons, lessonsSelector } from '@/models/index.js';
import { Search, WithLoading, Pagination } from '@/components/index.js';
import classNames from 'classnames';
import Icon from '@/icon.js';
import styles from './list-of-lessons.scss';

export const ListOfLessons = () => {
  const history = useHistory();
  const [searchLessonsThemeValue, setSearchLessonsThemeValue] = useState('');
  const [filteredLessonsList, setFilteredLessonsList] = useState([]);
  const [visibleLessonsList, setVisibleLessonsList] = useState([]);
  const [searchLessonsDateValue, setSearchLessonsDateValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [descendingSorts, setDescendingSorts] = useState({ id: true, themeName: false, lessonDate: false, lessonTime: false });
  const [prevSort, setPrevSort] = useState('id');
  const { data, isLoading } = useSelector(lessonsSelector, shallowEqual);
  const { currentUser } = useSelector(currentUserSelector, shallowEqual);
  const getLessons = useActions(fetchLessons);
  
  const lessonsPerPage = 10;
  const indexOfLast = currentPage * lessonsPerPage;
  const indexOfFirst = indexOfLast - lessonsPerPage;
  
  useEffect(() => {
    getLessons();
  }, [getLessons]);
  
  const transformDateTime = (dateTime) => {
    const arr = dateTime.toString().split('T');
    return {
      date: new Date(arr[0]),
      time: arr[1],
    };
  };
  
  useEffect(() => {
    setFilteredLessonsList(
      data.map((lesson, index) => {
        transformDateTime(lesson.lessonDate);
        const { date, time } = transformDateTime(lesson.lessonDate);
        lesson.lessonDate = date;
        lesson.lessonTime = time;
        lesson.index = index;
        return lesson;
      })
    );
    setVisibleLessonsList(filteredLessonsList.slice(indexOfFirst, indexOfLast))
  }, [data]);
  
  useEffect(() => {
    setVisibleLessonsList(filteredLessonsList.slice(indexOfFirst, indexOfLast));
  }, [currentPage, filteredLessonsList]);
  
  useEffect(() => {
    const lessons = data.filter(
      (lesson) => lesson.themeName.toUpperCase().includes(searchLessonsThemeValue.toUpperCase()),
    ).filter(
      (lesson) => lesson.lessonDate.toString().includes(searchLessonsDateValue),
    );
    setFilteredLessonsList(lessons);
    setCurrentPage(1);
  }, [searchLessonsDateValue, searchLessonsThemeValue, currentPage]);
  
  const handleSearchTheme = (inputValue) => {
    setSearchLessonsThemeValue(inputValue);
  };
  
  const handleSearchDate = (event) => {
    const date = event.target.value;
    setSearchLessonsDateValue(date);
  };
  
  const addLesson = () => {
    history.push(paths.LESSON_ADD);
  };
  
  const lessonDetails = useCallback((id) => {
    history.push(`${paths.LESSON_DETAILS}/${id}`);
  })
  
  const editLesson = useCallback((event, id) => {
    event.stopPropagation();
    history.push(`${paths.LESSON_EDIT}/${id}`);
  })
  
  const handleSortByParam = (key) => {
    if (prevSort === key) {
      descendingSorts[key] = descendingSorts[key] ? false : true;
      setDescendingSorts(descendingSorts);
    } else {
      setDescendingSorts({ id: false, themeName: false, lessonDate: false, lessonTime: false });
    }
    setPrevSort(key);
    
    const sortedLessons = [...filteredLessonsList].sort((a, b) => {
      if (descendingSorts[key]) {
        return a[key] <= b[key] ? -1 : 1;
      } else {
        return b[key] <= a[key] ? -1 : 1;
      }
    });
    setFilteredLessonsList(sortedLessons);
    setVisibleLessonsList(filteredLessonsList.slice(indexOfFirst, indexOfLast));
  }
  
  const paginate = (pageNumber) => {
    if(currentPage !== pageNumber) {
      setCurrentPage(pageNumber);
    }
  };
  const nextPage = (pageNumber) => {
    const totalPages = Math.ceil(filteredLessonsList?.length / lessonsPerPage);
    setCurrentPage(currentPage === totalPages ? currentPage : pageNumber);
  };
  const prevPage = (pageNumber) => {
    setCurrentPage(currentPage - 1 === 0 ? currentPage : pageNumber);
  };
  
  const getLessonsList = () => {
    const lessonsList = visibleLessonsList.map((lesson) => {
      return (
        <tr id={lesson.id} key={lesson.id} onClick={() => lessonDetails(lesson.id)}>
          <td className="text-center">{lesson.index + 1}</td>
          <td>{lesson.themeName}</td>
          <td>{lesson.lessonDate.toDateString()}</td>
          <td>{lesson.lessonTime}</td>
          {currentUser.role !== 2 ?
            <td onClick={(e) => {
              editLesson(e, lesson.id)}
            }>
              <Icon className={classNames(styles.edit)} icon="Edit" color="#2E3440" size={30} />
            </td> : null}
        </tr>
      );
    });
    
    if (!lessonsList.length && searchLessonsDateValue || !lessonsList.length && searchLessonsThemeValue) {
      return <td colSpan="5" className="text-center">Lesson is not found</td>;
    }
    return lessonsList;
  };
  
  return (
    <div className="container">
      <div className="row">
        <div className="d-flex w-100 justify-content-between">
          <h3>
            Lessons
          </h3>
          <div className="d-flex justify-content-end w-50">
            <div className="col-4">
              {filteredLessonsList.length > lessonsPerPage ? <span className="text-right">{filteredLessonsList.length} lessons</span> : null}
            </div>
            {filteredLessonsList.length > lessonsPerPage && !isLoading &&
            <Pagination
              itemsPerPage={lessonsPerPage}
              totalItems={filteredLessonsList.length}
              paginate={paginate}
              prevPage={prevPage}
              nextPage={nextPage}
              page={currentPage}
            />
            }
          </div>
        </div>
        <div className={classNames(styles.page, 'container pt-4')}>
          <div className="d-flex justify-content-between pb-3">
            <div className="d-flex justify-content-start">
              <div>
                <button className={classNames(styles['button-sort'])}>
                  <Icon icon="List" color="#2E3440" size={40} className="px-1" />
               </button>
                <button className={classNames(styles['button-sort'])}>
                  <Icon icon="Card" color="#2E3440" size={40} className="px-1" />
                </button>
              </div>
              <div className="px-2">
                <Search onSearch={handleSearchTheme} className={classNames(styles.text)} placeholder="Theme's name" />
              </div>
              <div className="px-2">
                <input
                  className={classNames(styles.date, 'form-control')}
                  type="date"
                  name="lesson_date"
                  required
                  onChange={handleSearchDate}
                />
              </div>
            </div>
            <div className="d-flex justify-content-end">
              {currentUser.role !== 2 &&
              <div>
                <button
                  className={classNames(styles.button)}
                  onClick={addLesson}
                >
                  <span className="text-white">Add a lesson</span>
                </button>
              </div>
              }
            </div>
          </div>
          <WithLoading isLoading={isLoading} className="d-block mx-auto mt-3">
            <table className="table table-hover">
              <thead>
              <tr>
                <th
                  scope="col"
                  className={classNames(`${descendingSorts.id ? classNames(styles.descending) : ''}`, 'text-center', 'align-middle')}
                  onClick={() => handleSortByParam('id')}
                >
                  <button
                    className={classNames(styles['button-sort'])}
                  >
                    <span className="font-weight-bolder">#</span>
                    <span className="pl-2">
                        <Icon className={classNames(styles['arrow-down'])} icon="DropDown" color="#2E3440" size={25} />
                        <Icon className={classNames(styles['arrow-up'])} icon="DropUp" color="#2E3440" size={25} />
                    </span>
                  </button>
                </th>
                <th
                  scope="col"
                  className={classNames(`${descendingSorts.themeName ? classNames(styles.descending) : ''}`)}
                  onClick={() => handleSortByParam('themeName')}
                >
                  <button
                    className={classNames(styles['button-sort'])}
                  >
                    <span className="font-weight-bolder">Theme Name</span>
                    <span className="pl-2">
                      <Icon className={classNames(styles['arrow-down'])} icon="DropDown" color="#2E3440" size={25} />
                      <Icon className={classNames(styles['arrow-up'])} icon="DropUp" color="#2E3440" size={25} />
                    </span>
                  </button>
                </th>
                <th
                  scope="col"
                  className={classNames(`${descendingSorts.lessonDate ? classNames(styles.descending) : ''}`)}
                  onClick={() => handleSortByParam('lessonDate')}
                >
                  <button
                    className={classNames(styles['button-sort'])}
                  >
                    <span className="font-weight-bolder">Date</span>
                    <span className="pl-2">
                      <Icon className={classNames(styles['arrow-down'])} icon="DropDown" color="#2E3440" size={25} />
                      <Icon className={classNames(styles['arrow-up'])} icon="DropUp" color="#2E3440" size={25} />
                      </span>
                  </button>
                </th>
                <th
                  scope="col"
                  className={classNames(`${descendingSorts.lessonTime ? classNames(styles.descending) : ''}`)}
                  onClick={() => handleSortByParam('lessonTime')}
                >
                  <button
                    className={classNames(styles['button-sort'])}
                  >
                    <span className="font-weight-bolder">Time</span>
                    <span className="pl-2">
                      <Icon className={classNames(styles['arrow-down'])} icon="DropDown" color="#2E3440" size={25} />
                      <Icon className={classNames(styles['arrow-up'])} icon="DropUp" color="#2E3440" size={25} />
                    </span>
                  </button>
                </th>
                {currentUser.role !== 2 ? <th scope="col" className="align-middle">Edit</th> : null}
              </tr>
              </thead>
              <tbody>
                {
                  getLessonsList()
                }
              </tbody>
            </table>
          </WithLoading>
        </div>
      </div>
      {filteredLessonsList.length > 12 && !isLoading &&
        <Pagination 
          itemsPerPage={lessonsPerPage} 
          totalItems={filteredLessonsList.length} 
          paginate={paginate}
          prevPage={prevPage}
          nextPage={nextPage}
          page={currentPage}
        />
      }
    </div>
  );
};
