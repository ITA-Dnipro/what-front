import React, { useState, useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useActions } from '@/shared/index.js';
import { Card, Search, Button, WithLoading } from '../../components/index.js';
import { fetchCourses, coursesSelector } from '@/models/index.js';
import Icon from '../../icon.js';
import classNames from 'classnames';
import styles from './list-of-courses.scss';

export const ListOfCourses = () => {
  const [loadCourses] = useActions([fetchCourses]);

  const [searchValue, setSearchValue] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  const {data, isLoading} = useSelector(coursesSelector, shallowEqual);

  const history = useHistory();

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    setFilteredCourses(data);
  }, [data]);

  const handleSearch = (inputValue) => {
    setSearchValue(inputValue);
    setFilteredCourses(data.filter(({name}) => {
      return name.toUpperCase().includes(inputValue.toUpperCase());
    }))
  };

  const addCourse = () => {
    history.push('/add-course');
  };

  const courseDetails = (id) => {
    history.push(`/courses/${id}`);
  };

  const courseEdit = (id) => {
    history.push(`/courses/edit-courses/${id}`)
  };

  const coursesList = () => {

    const courses = filteredCourses.map((course) => (
      <Card
        key={course.id}
        id={course.id}
        buttonName='Details'
        iconName='Edit'
        onEdit={courseEdit}
        onDetails={courseDetails}
        >{course.name}
      </Card>
    ));

    if(!courses.length && searchValue) {
      return <h4>Courses not found</h4>
    }
    return courses;
  };

  return (
    <div className={classNames('container')}>
      <div className="row">
        <div className={classNames(styles['list-head'], 'col-12 mb-2')}>
          <div className={styles['search-container']}>
            <Search onSearch={handleSearch} placeholder="Enter a course's name" />
          </div>
          <Button onClick={addCourse} variant="warning" className={styles.button}>
            <Icon icon="Plus" className="icon" />
            Add a Course
          </Button>
        </div>
        <hr className="col-8" />
        <div className="col-12 d-flex flex-row flex-wrap justify-content-center">
          <WithLoading isLoading={isLoading}>
            {
              coursesList()
            }
          </WithLoading>
        </div>
      </div>
    </div>
  );
}